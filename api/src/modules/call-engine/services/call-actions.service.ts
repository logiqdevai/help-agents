import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ActionKind,
  ActionStatus,
  ActorType,
  AlertSeverity,
  AlertType,
  Call,
  CallAction,
  IntegrationCategory,
  IntegrationStatus,
  Prisma,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CANONICAL_ACTION_KEYS } from '@/shared/constants/crm-fields';
import { CrmService } from '@/modules/integrations/crm/crm.service';
import { ACTION_RETRY_DELAYS_MINUTES } from '../call-engine.constants';
import { CallActionHandler, RequestActionInput } from '../interfaces/call-engine.interface';

const MAX_PAYLOAD_BYTES = 64 * 1024;
const WAIT_TIMEOUT_MS = 20_000;
const STALE_APPROVED_MS = 10 * 60 * 1000;
const STALE_REQUESTED_MS = 2 * 60 * 1000;
const CANONICAL_KEYS = new Set<string>(Object.values(CANONICAL_ACTION_KEYS));

class NonRetryableActionError extends Error {}

/**
 * Safe-action pipeline (spec §33, §34, §44): the AI and automations only REQUEST actions; the
 * platform validates, executes, retries with backoff and flags what needs attention.
 */
@Injectable()
export class CallActionsService {
  private readonly logger = new Logger(CallActionsService.name);
  private readonly handlers = new Map<ActionKind, CallActionHandler>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly crm: CrmService,
    private readonly alerts: AlertsService,
    private readonly activity: ActivityLogService,
  ) {}

  registerHandler(handler: CallActionHandler): void {
    this.handlers.set(handler.kind, handler);
  }

  async requestAction(input: RequestActionInput): Promise<CallAction> {
    const call = await this.prisma.call.findFirst({
      where: { id: input.call_uuid, company_uuid: input.company_uuid },
      include: { agent: { select: { id: true, crm_integration_uuid: true } } },
    });
    if (!call) throw new NotFoundException('Call not found');

    const agentUuid = input.agent_uuid === undefined ? call.agent_uuid : input.agent_uuid;
    const kind = input.kind ?? this.kindFor(input.tool_key);
    const isCanonical = CANONICAL_KEYS.has(input.tool_key);

    let integrationUuid = input.integration_uuid ?? null;
    if (!integrationUuid && kind === ActionKind.CRM) {
      integrationUuid = call.agent?.crm_integration_uuid ?? null;
    }

    const { rejection, crmToolUuid } = await this.validate({
      input,
      call,
      kind,
      isCanonical,
      agentUuid,
      integrationUuid,
    });

    const created = await this.prisma.callAction.create({
      data: {
        company_uuid: input.company_uuid,
        call_uuid: call.id,
        agent_uuid: agentUuid,
        integration_uuid: integrationUuid,
        crm_tool_uuid: crmToolUuid,
        automation_action_uuid: input.automation_action_uuid ?? null,
        kind,
        tool_key: input.tool_key,
        status: rejection ? ActionStatus.REJECTED : ActionStatus.REQUESTED,
        request_payload: (input.payload ?? {}) as Prisma.InputJsonValue,
        rejection_reason: rejection,
        next_retry_at: !rejection && input.run_at ? input.run_at : null,
      },
    });

    await this.recordEvent(call.id, rejection ? 'action.rejected' : 'action.requested', rejection ?? input.tool_key, {
      action_uuid: created.id,
      tool_key: input.tool_key,
      source: input.source,
    });
    await this.activity.log({
      company_uuid: input.company_uuid,
      actor_type: input.source === 'AGENT' ? ActorType.AGENT : ActorType.SYSTEM,
      action: rejection ? 'crm.action_rejected' : 'crm.action_requested',
      entity_type: 'call_action',
      entity_uuid: created.id,
      metadata: { call_uuid: call.id, tool_key: input.tool_key, source: input.source },
    });

    if (rejection || input.run_at) return created;

    const approved = await this.prisma.callAction.update({
      where: { id: created.id },
      data: { status: ActionStatus.APPROVED },
    });

    if (input.wait) return this.runWithTimeout(approved, call);

    setImmediate(() => {
      this.run(approved, call).catch((e) => this.logger.error(`Action ${approved.id} crashed: ${e?.message}`));
    });
    return approved;
  }

  async retryAction(companyUuid: string, actionUuid: string): Promise<CallAction> {
    const action = await this.prisma.callAction.findFirst({
      where: { id: actionUuid, company_uuid: companyUuid },
      include: { call: true },
    });
    if (!action) throw new NotFoundException('Action not found');

    const retryable: ActionStatus[] = [
      ActionStatus.FAILED,
      ActionStatus.RETRYING,
      ActionStatus.NEEDS_ATTENTION,
    ];
    if (!retryable.includes(action.status)) {
      throw new BadRequestException('Only failed actions can be retried');
    }

    const claimed = await this.prisma.callAction.updateMany({
      where: { id: action.id, status: action.status, updated_at: action.updated_at },
      data: { status: ActionStatus.APPROVED, attempt_count: 0, next_retry_at: null, last_error: null },
    });
    if (claimed.count === 0) throw new BadRequestException('Action is already being processed');

    const fresh = await this.prisma.callAction.findUnique({ where: { id: action.id } });
    return this.runWithTimeout(fresh, action.call);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    try {
      await this.processDue();
    } catch (error) {
      this.logger.error(`processDue failed: ${error?.message}`);
    }
  }

  async processDue(): Promise<void> {
    const now = new Date();
    const candidates = await this.prisma.callAction.findMany({
      where: {
        OR: [
          {
            status: { in: [ActionStatus.REQUESTED, ActionStatus.RETRYING] },
            next_retry_at: { lte: now },
          },
          {
            status: ActionStatus.REQUESTED,
            next_retry_at: null,
            created_at: { lt: new Date(now.getTime() - STALE_REQUESTED_MS) },
          },
          {
            status: ActionStatus.APPROVED,
            updated_at: { lt: new Date(now.getTime() - STALE_APPROVED_MS) },
          },
        ],
      },
      orderBy: { updated_at: 'asc' },
      take: 50,
      include: { call: true },
    });

    for (const candidate of candidates) {
      const claimed = await this.prisma.callAction.updateMany({
        where: { id: candidate.id, status: candidate.status, updated_at: candidate.updated_at },
        data: { status: ActionStatus.APPROVED },
      });
      if (claimed.count === 0) continue;

      const action = await this.prisma.callAction.findUnique({ where: { id: candidate.id } });
      await this.run(action, candidate.call);
    }
  }

  private async validate(ctx: {
    input: RequestActionInput;
    call: Call;
    kind: ActionKind;
    isCanonical: boolean;
    agentUuid: string | null;
    integrationUuid: string | null;
  }): Promise<{ rejection: string | null; crmToolUuid: string | null }> {
    const { input, kind, isCanonical, agentUuid, integrationUuid } = ctx;
    let crmToolUuid: string | null = null;

    if (input.payload !== undefined) {
      const payload = input.payload as unknown;
      if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
        return { rejection: 'Action payload must be an object', crmToolUuid };
      }
      if (Buffer.byteLength(JSON.stringify(payload)) > MAX_PAYLOAD_BYTES) {
        return { rejection: 'Action payload is too large', crmToolUuid };
      }
    }

    if (input.source === 'AGENT') {
      if (isCanonical || kind !== ActionKind.CRM) {
        return { rejection: 'The agent is not allowed to request this action', crmToolUuid };
      }
      if (!agentUuid) return { rejection: 'The action has no agent', crmToolUuid };

      const allowed = await this.prisma.agentCrmTool.findFirst({
        where: {
          agent_uuid: agentUuid,
          agent: { company_uuid: input.company_uuid },
          crm_tool: {
            key: input.tool_key,
            is_active: true,
            OR: [{ company_uuid: null }, { company_uuid: input.company_uuid }],
          },
        },
        include: { crm_tool: true },
      });
      if (!allowed) {
        return { rejection: `The agent is not allowed to use "${input.tool_key}"`, crmToolUuid };
      }
      crmToolUuid = allowed.crm_tool_uuid;
    }

    if (kind === ActionKind.CRM) {
      if (!integrationUuid) return { rejection: 'No CRM connection is configured', crmToolUuid };

      const integration = await this.prisma.integration.findFirst({
        where: { id: integrationUuid, company_uuid: input.company_uuid },
      });
      if (!integration || integration.category !== IntegrationCategory.CRM) {
        return { rejection: 'CRM connection not found', crmToolUuid };
      }
      if (integration.status !== IntegrationStatus.ACTIVE) {
        return { rejection: 'The CRM connection is not active', crmToolUuid };
      }

      if (crmToolUuid) {
        const tool = await this.prisma.crmTool.findUnique({ where: { id: crmToolUuid } });
        const mismatch =
          !tool ||
          tool.provider !== integration.provider ||
          (tool.integration_uuid && tool.integration_uuid !== integration.id);
        if (mismatch) return { rejection: 'This tool does not belong to the CRM connection', crmToolUuid };
      }
    }

    return { rejection: null, crmToolUuid };
  }

  private kindFor(toolKey: string): ActionKind {
    if (toolKey.startsWith('email.')) return ActionKind.EMAIL;
    if (toolKey.startsWith('sms.')) return ActionKind.MESSAGING;
    if (toolKey.startsWith('calendar.')) return ActionKind.CALENDAR;
    if (toolKey.startsWith('webhook.')) return ActionKind.OTHER;
    return ActionKind.CRM;
  }

  private async runWithTimeout(action: CallAction, call: Call): Promise<CallAction> {
    const execution = this.run(action, call);
    execution.catch((e) => this.logger.error(`Action ${action.id} crashed: ${e?.message}`));

    let timer: NodeJS.Timeout;
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), WAIT_TIMEOUT_MS);
    });
    const done = await Promise.race([execution, timeout]);
    clearTimeout(timer);

    return done ?? (await this.prisma.callAction.findUnique({ where: { id: action.id } }));
  }

  /** Executes one claimed (APPROVED) action and persists the outcome; never throws for execution errors. */
  private async run(action: CallAction, call: Call): Promise<CallAction> {
    const attempt = action.attempt_count + 1;

    try {
      const result = await this.dispatch(action, call);

      const done = await this.prisma.callAction.update({
        where: { id: action.id },
        data: {
          status: ActionStatus.EXECUTED,
          result: (result ?? {}) as Prisma.InputJsonValue,
          attempt_count: attempt,
          next_retry_at: null,
          last_error: null,
          executed_at: new Date(),
        },
      });

      await this.alerts.resolveFor(action.company_uuid, AlertType.CRM_UPDATE_FAILED, 'call_action', action.id);
      await this.recordEvent(call.id, 'action.executed', action.tool_key, { action_uuid: action.id });
      await this.activity.log({
        company_uuid: action.company_uuid,
        actor_type: ActorType.SYSTEM,
        action: 'crm.action_executed',
        entity_type: 'call_action',
        entity_uuid: action.id,
        metadata: { call_uuid: call.id, tool_key: action.tool_key },
      });
      return done;
    } catch (error) {
      return this.handleFailure(action, call, attempt, error);
    }
  }

  private async handleFailure(action: CallAction, call: Call, attempt: number, error: any): Promise<CallAction> {
    const message = String(error?.message ?? 'Action failed').slice(0, 500);
    const exhausted = error instanceof NonRetryableActionError || attempt >= action.max_attempts;

    const delayMinutes =
      ACTION_RETRY_DELAYS_MINUTES[Math.min(attempt - 1, ACTION_RETRY_DELAYS_MINUTES.length - 1)];

    const updated = await this.prisma.callAction.update({
      where: { id: action.id },
      data: {
        status: exhausted ? ActionStatus.NEEDS_ATTENTION : ActionStatus.RETRYING,
        attempt_count: attempt,
        last_error: message,
        next_retry_at: exhausted ? null : new Date(Date.now() + delayMinutes * 60_000),
      },
    });

    await this.recordEvent(call.id, 'action.failed', message, {
      action_uuid: action.id,
      tool_key: action.tool_key,
      attempt,
      needs_attention: exhausted,
    });
    await this.activity.log({
      company_uuid: action.company_uuid,
      actor_type: ActorType.SYSTEM,
      action: exhausted ? 'crm.action_needs_attention' : 'crm.action_failed',
      entity_type: 'call_action',
      entity_uuid: action.id,
      metadata: { call_uuid: call.id, tool_key: action.tool_key, attempt, error: message },
    });

    if (exhausted) {
      const isCrm = action.kind === ActionKind.CRM;
      await this.alerts.raise({
        company_uuid: action.company_uuid,
        type: isCrm ? AlertType.CRM_UPDATE_FAILED : AlertType.OTHER,
        severity: AlertSeverity.ERROR,
        title: isCrm ? 'CRM update failed' : 'Automated action failed',
        message: `The action "${action.tool_key}" could not be completed after ${attempt} attempt(s): ${message}`,
        entity_type: 'call_action',
        entity_uuid: action.id,
        metadata: { call_uuid: call.id, tool_key: action.tool_key },
      });
    }
    return updated;
  }

  private async dispatch(action: CallAction, call: Call): Promise<Prisma.InputJsonValue> {
    if (action.kind === ActionKind.CRM) {
      if (!action.integration_uuid) throw new NonRetryableActionError('No CRM connection configured');

      const integration = await this.prisma.integration.findFirst({
        where: { id: action.integration_uuid, company_uuid: action.company_uuid },
      });
      if (!integration || integration.category !== IntegrationCategory.CRM) {
        throw new NonRetryableActionError('CRM connection not found');
      }
      if (integration.status === IntegrationStatus.DISCONNECTED) {
        throw new NonRetryableActionError('CRM connection is disconnected');
      }

      if (action.tool_key === CANONICAL_ACTION_KEYS.CRM_SYNC_CALL_RESULT) {
        const res = await this.crm.syncCallResult({
          company_uuid: action.company_uuid,
          integration_uuid: action.integration_uuid,
          agent_uuid: action.agent_uuid ?? call.agent_uuid,
          call_uuid: call.id,
          contact_uuid: call.contact_uuid,
        });
        return this.toJson(res);
      }

      const contact = call.contact_uuid
        ? await this.prisma.contact.findFirst({
            where: { id: call.contact_uuid, company_uuid: action.company_uuid },
          })
        : null;

      const res = await this.crm.executeTool({
        company_uuid: action.company_uuid,
        integration_uuid: action.integration_uuid,
        tool_key: action.tool_key,
        input: {
          ...((action.request_payload as Record<string, any>) ?? {}),
          // Call context so the CRM adapter can resolve the record being worked on.
          _context: {
            call_uuid: call.id,
            contact: contact && {
              id: contact.id,
              external_id: contact.external_id,
              record_type: contact.record_type,
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
            },
          },
        },
      });
      if (!res.success) throw new Error('The CRM did not accept the action');
      return this.toJson(res);
    }

    const handler = this.handlers.get(action.kind);
    if (!handler) throw new NonRetryableActionError(`No handler available for ${action.kind} actions`);
    return handler.execute(action, call);
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  private async recordEvent(callUuid: string, type: string, message: string, data: Record<string, any>) {
    try {
      await this.prisma.callEvent.create({
        data: { call_uuid: callUuid, type, message: message?.slice(0, 500), data },
      });
    } catch (error) {
      this.logger.error(`Failed to write call event: ${error?.message}`);
    }
  }
}
