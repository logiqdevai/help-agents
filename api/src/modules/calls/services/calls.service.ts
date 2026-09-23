import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  ActionStatus,
  CallDirection,
  CallStatus,
  IntegrationCategory,
  Prisma,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { CallPlacementService } from '@/modules/call-engine/services/call-placement.service';
import { CallActionsService } from '@/modules/call-engine/services/call-actions.service';
import {
  ACTION_LABELS,
  ISSUE_ACTION_STATUSES,
  RECORDING_URL_TTL_MINUTES,
  RETRYABLE_ACTION_STATUSES,
} from '../calls.constants';
import { CallsQueryType } from '../dto/calls-query.schema';
import { CreateCallDto } from '../dto/create-call.dto';
import { CreateTestCallDto } from '../dto/create-test-call.dto';
import {
  decimalToNumber,
  humanizeKey,
  stripProviderInfo,
} from '../utils/calls.utils';
import { CallRecordingsService } from './call-recordings.service';
import { CallTimelineService } from './call-timeline.service';

const LIST_SELECT = {
  id: true,
  call_number: true,
  started_at: true,
  created_at: true,
  contact_name: true,
  from_number: true,
  to_number: true,
  direction: true,
  status: true,
  is_test: true,
  duration_seconds: true,
  outcome_key: true,
  outcome_label: true,
  is_successful: true,
  total_cost: true,
  currency: true,
  recording_path: true,
  recording_deleted_at: true,
  agent: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true } },
  actions: {
    where: { status: { in: ISSUE_ACTION_STATUSES } },
    select: { id: true },
    take: 1,
  },
} satisfies Prisma.CallSelect;

const DETAIL_SELECT = {
  ...LIST_SELECT,
  answered_at: true,
  ended_at: true,
  attempt_number: true,
  summary: true,
  transcript: true,
  transcript_text: true,
  gathered_data: true,
  in_voicemail: true,
  analysis_status: true,
  transferred_to: true,
  transfer_reason: true,
  recording_duration_seconds: true,
  recording_expires_at: true,
  agent_uuid: true,
  agent_snapshot: true,
  knowledge_snapshot: true,
  ai_cost: true,
  telephony_cost: true,
  error_message: true,
  contact: {
    select: { id: true, name: true, phone: true, email: true, external_url: true, record_type: true },
  },
  events: { orderBy: { occurred_at: 'asc' }, take: 500 },
  cost_items: { orderBy: { created_at: 'asc' } },
  actions: {
    orderBy: { created_at: 'asc' },
    include: { crm_tool: { select: { name: true } } },
  },
} satisfies Prisma.CallSelect;

type ListRow = Prisma.CallGetPayload<{ select: typeof LIST_SELECT }>;
type DetailRow = Prisma.CallGetPayload<{ select: typeof DETAIL_SELECT }>;

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AgentAccessService,
    private readonly activity: ActivityLogService,
    private readonly voice: VoiceProviderService,
    private readonly placement: CallPlacementService,
    private readonly actions: CallActionsService,
    private readonly recordings: CallRecordingsService,
    private readonly timeline: CallTimelineService,
  ) {}

  // ------------------------------------------------------------------ list

  async list(ctx: CompanyContextData, query: CallsQueryType) {
    const where = await this.buildWhere(ctx, query);

    const [rows, total] = await Promise.all([
      this.prisma.call.findMany({
        where,
        select: LIST_SELECT,
        orderBy: [{ [query.order_by]: query.order_direction }, { call_number: 'desc' }],
        ...skipTake(query),
      }),
      this.prisma.call.count({ where }),
    ]);

    return paginated(rows.map((row) => this.mapListItem(row)), total, query.page, query.limit);
  }

  private async buildWhere(ctx: CompanyContextData, query: CallsQueryType): Promise<Prisma.CallWhereInput> {
    const and: Prisma.CallWhereInput[] = [await this.access.agentScope(ctx)];

    if (query.agent_uuid) and.push({ agent_uuid: query.agent_uuid });
    if (query.outcome_key) and.push({ outcome_key: query.outcome_key });
    if (query.status?.length) and.push({ status: { in: query.status } });
    if (query.direction) and.push({ direction: query.direction });
    if (query.contact_uuid) and.push({ contact_uuid: query.contact_uuid });
    if (query.is_test !== 'all') and.push({ is_test: query.is_test === 'true' });

    if (query.integration_uuid) {
      and.push({
        OR: [
          { agent: { crm_integration_uuid: query.integration_uuid } },
          { contact: { integration_uuid: query.integration_uuid } },
        ],
      });
    }

    if (query.from || query.to) {
      const company = await this.prisma.company.findUnique({
        where: { id: ctx.company_uuid },
        select: { timezone: true },
      });
      const zone = company?.timezone || 'UTC';
      const range: Prisma.DateTimeFilter = {};
      if (query.from) range.gte = this.parseBound(query.from, zone, false);
      if (query.to) range.lte = this.parseBound(query.to, zone, true);
      and.push({
        OR: [{ started_at: range }, { started_at: null, created_at: range }],
      });
    }

    if (query.search) {
      const term = query.search;
      const numeric = /^#?\d+$/.test(term) ? parseInt(term.replace('#', ''), 10) : null;
      and.push({
        OR: [
          { contact_name: { contains: term, mode: 'insensitive' } },
          { contact: { name: { contains: term, mode: 'insensitive' } } },
          { to_number: { contains: term } },
          { from_number: { contains: term } },
          ...(numeric !== null && numeric <= 2147483647 ? [{ call_number: numeric }] : []),
        ],
      });
    }

    return { company_uuid: ctx.company_uuid, AND: and };
  }

  private parseBound(value: string, zone: string, endOfRange: boolean): Date {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const parsed = DateTime.fromISO(value, { zone });
    if (!dateOnly) return parsed.toJSDate();
    return (endOfRange ? parsed.endOf('day') : parsed.startOf('day')).toJSDate();
  }

  // ---------------------------------------------------------------- detail

  async getOne(ctx: CompanyContextData, id: string) {
    const call = await this.prisma.call.findFirst({
      where: { id, company_uuid: ctx.company_uuid, ...(await this.access.agentScope(ctx)) },
      select: DETAIL_SELECT,
    });
    if (!call) throw new NotFoundException('Call not found');
    return this.mapDetail(call);
  }

  async getEvents(ctx: CompanyContextData, id: string) {
    await this.assertCallAccess(ctx, id);
    const events = await this.prisma.callEvent.findMany({
      where: { call_uuid: id },
      orderBy: { occurred_at: 'asc' },
    });
    return { data: events.map((e) => this.mapEvent(e)) };
  }

  private mapListItem(row: ListRow) {
    return {
      id: row.id,
      call_number: row.call_number,
      started_at: row.started_at,
      created_at: row.created_at,
      agent: row.agent,
      contact: row.contact,
      contact_name: row.contact_name ?? row.contact?.name ?? null,
      from_number: row.from_number,
      to_number: row.to_number,
      direction: row.direction,
      duration_seconds: row.duration_seconds,
      status: row.status,
      outcome: row.outcome_key
        ? { key: row.outcome_key, label: row.outcome_label ?? row.outcome_key, is_successful: row.is_successful }
        : null,
      total_cost: decimalToNumber(row.total_cost),
      currency: row.currency,
      is_test: row.is_test,
      has_recording: !!row.recording_path && !row.recording_deleted_at,
      has_pending_issues: row.actions.length > 0,
    };
  }

  private async mapDetail(row: DetailRow) {
    const information = await this.buildInformation(row);
    const crmActions = row.actions.map((action) => ({
      id: action.id,
      tool_key: action.tool_key,
      kind: action.kind,
      label: ACTION_LABELS[action.tool_key] ?? action.crm_tool?.name ?? humanizeKey(action.tool_key),
      status: action.status,
      executed_at: action.executed_at,
      attempt_count: action.attempt_count,
      max_attempts: action.max_attempts,
      next_retry_at: action.next_retry_at,
      error: this.safeError(action.status, action.last_error, action.rejection_reason),
      can_retry: RETRYABLE_ACTION_STATUSES.includes(action.status),
    }));

    const warnings: Array<Record<string, any>> = [];
    for (const action of crmActions) {
      if (action.status === ActionStatus.FAILED || action.status === ActionStatus.NEEDS_ATTENTION) {
        warnings.push({
          type: action.kind === 'CRM' ? 'CRM_UPDATE_FAILED' : 'ACTION_FAILED',
          message: action.kind === 'CRM' ? 'CRM update failed' : `${action.label} failed`,
          action_uuid: action.id,
          can_retry: action.can_retry,
        });
      }
    }
    if (row.status === CallStatus.FAILED) {
      warnings.push({ type: 'CALL_FAILED', message: row.error_message ?? 'Call failed' });
    }
    if (row.analysis_status === 'FAILED') {
      warnings.push({ type: 'ANALYSIS_FAILED', message: 'The call could not be analyzed' });
    }

    const recordingAvailable = this.isRecordingAvailable(row);

    return {
      ...this.mapListItem(row as unknown as ListRow),
      has_pending_issues: crmActions.some((a) => ISSUE_ACTION_STATUSES.includes(a.status)),
      answered_at: row.answered_at,
      ended_at: row.ended_at,
      attempt_number: row.attempt_number,
      contact: row.contact,
      in_voicemail: row.in_voicemail,
      transferred: row.status === CallStatus.TRANSFERRED,
      transferred_to: row.transferred_to,
      transfer_reason: row.transfer_reason,
      summary: row.summary,
      transcript: Array.isArray(row.transcript) ? row.transcript : [],
      transcript_text: row.transcript_text,
      information_gathered: information,
      crm_actions: crmActions,
      cost: {
        ai: decimalToNumber(row.ai_cost),
        telephony: decimalToNumber(row.telephony_cost),
        total: decimalToNumber(row.total_cost),
        currency: row.currency,
        items: row.cost_items.map((item) => ({
          category: item.category,
          description: item.description,
          quantity: decimalToNumber(item.quantity),
          unit: item.unit,
          unit_price: decimalToNumber(item.unit_price),
          amount: decimalToNumber(item.amount),
          currency: item.currency,
        })),
      },
      activity_log: row.events.map((event) => this.mapEvent(event)),
      recording: {
        available: recordingAvailable,
        duration_seconds: recordingAvailable ? row.recording_duration_seconds : null,
        expires_at: row.recording_expires_at,
      },
      knowledge_used: this.mapKnowledge(row.knowledge_snapshot),
      warnings,
      error_message: row.error_message,
      analysis_status: row.analysis_status,
    };
  }

  private mapEvent(event: { id: string; type: string; message: string | null; data: unknown; occurred_at: Date }) {
    return {
      id: event.id,
      type: event.type,
      message: event.message ? stripProviderInfo(event.message) : null,
      data: event.data ? stripProviderInfo(event.data) : null,
      occurred_at: event.occurred_at,
    };
  }

  private safeError(status: ActionStatus, lastError: string | null, rejection: string | null): string | null {
    if (status === ActionStatus.REJECTED) return rejection ? stripProviderInfo(rejection).slice(0, 300) : null;
    if (!lastError) return null;
    return stripProviderInfo(lastError).slice(0, 300);
  }

  private mapKnowledge(snapshot: unknown): Array<{ name: string; version: number | null }> {
    const list = Array.isArray(snapshot)
      ? snapshot
      : Array.isArray((snapshot as any)?.sources)
        ? (snapshot as any).sources
        : [];
    return list
      .filter((item: any) => item && typeof item.name === 'string')
      .map((item: any) => ({ name: item.name, version: typeof item.version === 'number' ? item.version : null }));
  }

  private async buildInformation(row: DetailRow) {
    const data = row.gathered_data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];

    const snapshot = (row.agent_snapshot ?? {}) as Record<string, any>;
    let goalItems: any[] | undefined = snapshot.goal_items ?? snapshot.goalItems;
    let questions: any[] | undefined = snapshot.questions;

    if (!goalItems || !questions) {
      const agent = await this.prisma.agent.findUnique({
        where: { id: row.agent_uuid },
        select: {
          goal_items: { orderBy: { position: 'asc' }, select: { key: true, label: true } },
          questions: { orderBy: { position: 'asc' }, select: { question: true } },
        },
      });
      goalItems = goalItems ?? agent?.goal_items ?? [];
      questions = questions ?? agent?.questions ?? [];
    }

    const labelByKey = new Map<string, string>();
    for (const item of goalItems) if (item?.key && item?.label) labelByKey.set(item.key, item.label);

    return Object.entries(data as Record<string, unknown>)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        const match = /^question_(\d+)$/.exec(key);
        const questionText = match ? questions[parseInt(match[1], 10) - 1]?.question : undefined;
        return {
          key,
          label: labelByKey.get(key) ?? questionText ?? humanizeKey(key),
          value,
        };
      });
  }

  private isRecordingAvailable(row: {
    recording_path: string | null;
    recording_deleted_at: Date | null;
    recording_expires_at: Date | null;
  }): boolean {
    if (!row.recording_path || row.recording_deleted_at) return false;
    return !row.recording_expires_at || row.recording_expires_at > new Date();
  }

  // ------------------------------------------------------------- recording

  async getRecording(ctx: CompanyContextData, id: string) {
    const call = await this.prisma.call.findFirst({
      where: { id, company_uuid: ctx.company_uuid, ...(await this.access.agentScope(ctx)) },
      select: {
        recording_path: true,
        recording_deleted_at: true,
        recording_expires_at: true,
        recording_duration_seconds: true,
      },
    });
    if (!call || !this.isRecordingAvailable(call)) throw new NotFoundException('Recording not available');

    let url: string;
    try {
      url = await this.recordings.getSignedUrl(call.recording_path, RECORDING_URL_TTL_MINUTES);
    } catch (error) {
      this.logger.error(`Could not sign recording URL for call ${id}: ${error?.message}`);
      throw new NotFoundException('Recording not available');
    }

    return {
      url,
      expires_at: new Date(Date.now() + RECORDING_URL_TTL_MINUTES * 60 * 1000),
      duration_seconds: call.recording_duration_seconds,
    };
  }

  async logRecordingDownload(ctx: CompanyContextData, id: string) {
    await this.activity.logFor(ctx, 'call.recording_downloaded', 'call', id);
  }

  // --------------------------------------------------------------- actions

  async retryAction(ctx: CompanyContextData, id: string, actionId: string) {
    await this.assertCallAccess(ctx, id);

    const action = await this.prisma.callAction.findFirst({
      where: { id: actionId, call_uuid: id, company_uuid: ctx.company_uuid },
      select: { id: true, status: true },
    });
    if (!action) throw new NotFoundException('Action not found');
    if (!RETRYABLE_ACTION_STATUSES.includes(action.status)) {
      throw new BadRequestException('This action cannot be retried right now');
    }

    const result = await this.actions.retryAction(ctx.company_uuid, actionId);
    await this.activity.logFor(ctx, 'call.action_retried', 'call', id, { action_uuid: actionId });

    return {
      id: result.id,
      tool_key: result.tool_key,
      label: ACTION_LABELS[result.tool_key] ?? humanizeKey(result.tool_key),
      status: result.status,
      attempt_count: result.attempt_count,
      next_retry_at: result.next_retry_at,
      executed_at: result.executed_at,
      error: this.safeError(result.status, result.last_error, result.rejection_reason),
      can_retry: RETRYABLE_ACTION_STATUSES.includes(result.status),
    };
  }

  // ------------------------------------------------------------------ stop

  async stop(ctx: CompanyContextData, id: string) {
    const call = await this.prisma.call.findFirst({
      where: { id, company_uuid: ctx.company_uuid, ...(await this.access.agentScope(ctx)) },
      select: { id: true, status: true, external_call_id: true },
    });
    if (!call) throw new NotFoundException('Call not found');

    const stoppable: CallStatus[] = [CallStatus.QUEUED, CallStatus.RINGING, CallStatus.IN_PROGRESS];
    if (!stoppable.includes(call.status)) {
      throw new BadRequestException('Only calls that are still in progress can be stopped');
    }

    if (!call.external_call_id) {
      const canceled = await this.prisma.call.updateMany({
        where: { id, status: CallStatus.QUEUED, external_call_id: null },
        data: { status: CallStatus.CANCELED, ended_at: new Date() },
      });
      if (canceled.count === 0) throw new BadRequestException('The call is not ready to be stopped yet');
      await this.timeline.add(id, 'call.canceled', 'Call canceled before dialing');
    } else {
      await this.voice.stopCall(call.external_call_id);
      await this.timeline.add(id, 'call.stop_requested', 'Stop requested by a team member');
    }

    await this.activity.logFor(ctx, 'call.stopped', 'call', id);
    return { message: 'The call is being stopped' };
  }

  // ----------------------------------------------------------------- place

  async placeTest(ctx: CompanyContextData, dto: CreateTestCallDto) {
    return this.place(ctx, dto, true);
  }

  async placeManual(ctx: CompanyContextData, dto: CreateCallDto) {
    return this.place(ctx, dto, false);
  }

  private async place(ctx: CompanyContextData, dto: CreateCallDto, isTest: boolean) {
    if (!dto.contact_uuid && !dto.phone) {
      throw new BadRequestException('Provide a phone number or an existing contact');
    }

    await this.access.assertAgentAccess(ctx, dto.agent_uuid);

    let contactUuid: string | undefined;
    let toNumber: string | undefined;

    if (dto.contact_uuid) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: dto.contact_uuid, company_uuid: ctx.company_uuid },
        select: { id: true, phone: true },
      });
      if (!contact) throw new NotFoundException('Contact not found');

      // Test calls dial the number typed in; the contact is only linked when it is that same number.
      const typed = dto.phone ? toE164(dto.phone) : null;
      if (typed && contact.phone && toE164(contact.phone) !== typed) toNumber = dto.phone;
      else contactUuid = contact.id;
    } else {
      toNumber = dto.phone;
    }

    const call = await this.placement.placeCall({
      company_uuid: ctx.company_uuid,
      agent_uuid: dto.agent_uuid,
      contact_uuid: contactUuid,
      to_number: toNumber,
      contact_name: dto.name,
      is_test: isTest,
      requested_by_user_uuid: ctx.user_uuid,
    });

    const row = await this.prisma.call.findFirst({
      where: { id: call.id, company_uuid: ctx.company_uuid },
      select: LIST_SELECT,
    });
    return this.mapListItem(row);
  }

  // --------------------------------------------------------------- filters

  async getFilterOptions(ctx: CompanyContextData) {
    const scope = await this.access.agentScope(ctx);
    const agentScope = await this.access.agentScope(ctx, 'id');

    const [agents, outcomes, integrations] = await Promise.all([
      this.prisma.agent.findMany({
        where: { company_uuid: ctx.company_uuid, deleted_at: null, ...agentScope },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.call.groupBy({
        by: ['outcome_key', 'outcome_label'],
        where: { company_uuid: ctx.company_uuid, outcome_key: { not: null }, ...scope },
      }),
      this.prisma.integration.findMany({
        where: { company_uuid: ctx.company_uuid, category: IntegrationCategory.CRM },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const seen = new Set<string>();
    const distinctOutcomes: Array<{ key: string; label: string }> = [];
    for (const outcome of outcomes) {
      if (!outcome.outcome_key || seen.has(outcome.outcome_key)) continue;
      seen.add(outcome.outcome_key);
      distinctOutcomes.push({ key: outcome.outcome_key, label: outcome.outcome_label ?? outcome.outcome_key });
    }

    return {
      agents,
      outcomes: distinctOutcomes.sort((a, b) => a.label.localeCompare(b.label)),
      integrations,
      statuses: Object.values(CallStatus),
      directions: Object.values(CallDirection),
    };
  }

  // --------------------------------------------------------------- helpers

  private async assertCallAccess(ctx: CompanyContextData, id: string): Promise<void> {
    const call = await this.prisma.call.findFirst({
      where: { id, company_uuid: ctx.company_uuid, ...(await this.access.agentScope(ctx)) },
      select: { id: true },
    });
    if (!call) throw new NotFoundException('Call not found');
  }
}
