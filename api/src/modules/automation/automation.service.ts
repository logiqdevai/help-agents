import { Injectable, Logger } from '@nestjs/common';
import {
  ActionKind,
  ActorType,
  AutomationActionType,
  AutomationTrigger,
  Prisma,
  ScheduledCallSource,
  ScheduledCallStatus,
  AgentStatus,
} from 'generated/prisma';
import { DateTime } from 'luxon';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CANONICAL_ACTION_KEYS } from '@/shared/constants/crm-fields';
import { CallActionsService } from '@/modules/call-engine/services/call-actions.service';
import { CallingHoursService } from '@/modules/call-engine/services/calling-hours.service';
import { matchesConditions } from './utils/action-config.utils';
import { readPath, renderDeep, renderTemplate, TemplateContext } from './utils/template.utils';
import { safeZone } from '@/modules/scheduling/utils/scheduling.utils';

const CALL_INCLUDE = {
  agent: { select: { id: true, name: true, crm_integration_uuid: true } },
  outcome: { select: { id: true, key: true, label: true } },
  contact: true,
  company: { select: { timezone: true } },
} satisfies Prisma.CallInclude;

type LoadedCall = Prisma.CallGetPayload<{ include: typeof CALL_INCLUDE }>;
type LoadedRule = Prisma.AutomationRuleGetPayload<{ include: { actions: true } }>;
type LoadedAction = LoadedRule['actions'][number];

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

/**
 * "WHEN <trigger> THEN <actions>" rules (spec §29, §9). Actions never touch external systems
 * directly: they become CallActions (validated, executed and retried by CallActionsService)
 * or follow-up ScheduledCalls.
 */
@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly callActions: CallActionsService,
    private readonly callingHours: CallingHoursService,
    private readonly activity: ActivityLogService,
  ) {}

  /** Runs every matching enabled rule for a call. Never throws. */
  async runForCall(callUuid: string, trigger: AutomationTrigger): Promise<void> {
    try {
      const call = await this.loadCall(callUuid);
      if (!call || call.is_test) return;

      const rules = await this.loadRules(call, trigger);
      for (const rule of rules) {
        if (!matchesConditions(rule.conditions, call)) continue;

        let executed = 0;
        for (const action of rule.actions) {
          try {
            if (await this.runAction(call, rule, action)) executed++;
          } catch (error) {
            this.logger.error(
              `Rule ${rule.id} action ${action.id} (${action.type}) failed for call ${call.id}: ${error?.message}`,
            );
          }
        }

        if (executed > 0) {
          await this.activity.log({
            company_uuid: call.company_uuid,
            actor_type: ActorType.SYSTEM,
            action: 'automation.rule_triggered',
            entity_type: 'call',
            entity_uuid: call.id,
            metadata: { rule_uuid: rule.id, rule_name: rule.name, trigger, actions: executed },
          });
        }
      }
    } catch (error) {
      this.logger.error(`runForCall(${callUuid}, ${trigger}) failed: ${error?.message}`);
    }
  }

  private loadCall(callUuid: string) {
    return this.prisma.call.findUnique({
      where: { id: callUuid },
      include: CALL_INCLUDE,
    });
  }

  private loadRules(call: { company_uuid: string; agent_uuid: string; outcome_uuid: string | null }, trigger: AutomationTrigger) {
    return this.prisma.automationRule.findMany({
      where: {
        company_uuid: call.company_uuid,
        trigger,
        is_enabled: true,
        AND: [
          { OR: [{ agent_uuid: null }, { agent_uuid: call.agent_uuid }] },
          { OR: [{ outcome_uuid: null }, ...(call.outcome_uuid ? [{ outcome_uuid: call.outcome_uuid }] : [])] },
        ],
      },
      include: { actions: { orderBy: { position: 'asc' } } },
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  private async runAction(call: LoadedCall, rule: LoadedRule, action: LoadedAction): Promise<boolean> {
    const cfg = ((action.config as Record<string, any> | null) ?? {}) as Record<string, any>;
    const ctx = this.buildContext(call);
    const runAt = action.delay_minutes > 0 ? new Date(Date.now() + action.delay_minutes * 60_000) : undefined;

    switch (action.type) {
      case AutomationActionType.UPDATE_CRM: {
        const fields = cfg.fields && Object.keys(cfg.fields).length ? renderDeep(cfg.fields, ctx) : null;
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.CRM,
          tool_key: fields ? CANONICAL_ACTION_KEYS.CRM_UPDATE_RECORD : CANONICAL_ACTION_KEYS.CRM_SYNC_CALL_RESULT,
          payload: { ...this.basePayload(call, rule), ...(fields ? { fields } : {}) },
        });
      }

      case AutomationActionType.ADD_CRM_NOTE:
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.CRM,
          tool_key: CANONICAL_ACTION_KEYS.CRM_ADD_NOTE,
          payload: { ...this.basePayload(call, rule), note: renderTemplate(String(cfg.note ?? ''), ctx) },
        });

      case AutomationActionType.CREATE_CRM_TASK:
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.CRM,
          tool_key: CANONICAL_ACTION_KEYS.CRM_CREATE_TASK,
          payload: {
            ...this.basePayload(call, rule),
            title: renderTemplate(String(cfg.title ?? ''), ctx),
            notes: cfg.notes ? renderTemplate(String(cfg.notes), ctx) : null,
            due_at:
              typeof cfg.due_in_days === 'number'
                ? DateTime.now().plus({ days: cfg.due_in_days }).toUTC().toISO()
                : null,
          },
        });

      case AutomationActionType.SEND_EMAIL:
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.EMAIL,
          tool_key: CANONICAL_ACTION_KEYS.EMAIL_SEND,
          payload: {
            ...this.basePayload(call, rule),
            to: cfg.to === 'contact' ? (call.contact?.email ?? null) : renderTemplate(String(cfg.to ?? ''), ctx),
            subject: renderTemplate(String(cfg.subject ?? ''), ctx),
            body: renderTemplate(String(cfg.body ?? ''), ctx),
          },
        });

      case AutomationActionType.SEND_SMS:
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.MESSAGING,
          tool_key: CANONICAL_ACTION_KEYS.SMS_SEND,
          payload: {
            ...this.basePayload(call, rule),
            to: cfg.to === 'contact' ? (call.contact?.phone ?? null) : renderTemplate(String(cfg.to ?? ''), ctx),
            body: renderTemplate(String(cfg.body ?? ''), ctx),
          },
        });

      case AutomationActionType.CREATE_CALENDAR_EVENT: {
        const timezone = safeZone(call.company?.timezone);
        const start = this.resolveStart(String(cfg.start_from ?? ''), ctx, timezone);
        const attendee = cfg.attendee_email
          ? renderTemplate(String(cfg.attendee_email), ctx)
          : (call.contact?.email ?? null);
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.CALENDAR,
          tool_key: CANONICAL_ACTION_KEYS.CALENDAR_CREATE_EVENT,
          payload: {
            ...this.basePayload(call, rule),
            title: renderTemplate(String(cfg.title ?? ''), ctx),
            description: call.summary ?? null,
            start_iso: start,
            duration_minutes: cfg.duration_minutes,
            timezone,
            attendee_email: attendee || null,
          },
        });
      }

      case AutomationActionType.WEBHOOK:
        return this.requestAction(call, rule, action, runAt, {
          kind: ActionKind.OTHER,
          tool_key: CANONICAL_ACTION_KEYS.WEBHOOK_POST,
          payload: {
            ...this.basePayload(call, rule),
            url: cfg.url,
            headers: cfg.headers ?? {},
            body: this.webhookBody(call, rule, cfg.include ?? ['call', 'contact', 'gathered']),
          },
        });

      case AutomationActionType.SCHEDULE_FOLLOW_UP:
        return this.scheduleFollowUp(call, action, cfg);

      case AutomationActionType.CANCEL_FOLLOW_UPS:
        return this.cancelFollowUps(call);

      default:
        return false;
    }
  }

  private async requestAction(
    call: LoadedCall,
    rule: LoadedRule,
    action: LoadedAction,
    runAt: Date | undefined,
    input: { kind: ActionKind; tool_key: string; payload: Record<string, unknown> },
  ): Promise<boolean> {
    const existing = await this.prisma.callAction.findFirst({
      where: { call_uuid: call.id, automation_action_uuid: action.id },
      select: { id: true },
    });
    if (existing) return false;

    await this.callActions.requestAction({
      company_uuid: call.company_uuid,
      call_uuid: call.id,
      source: 'AUTOMATION',
      kind: input.kind,
      tool_key: input.tool_key,
      payload: input.payload as Prisma.InputJsonValue,
      agent_uuid: call.agent_uuid,
      automation_action_uuid: action.id,
      run_at: runAt,
    });
    return true;
  }

  private async scheduleFollowUp(
    call: LoadedCall,
    action: LoadedAction,
    cfg: Record<string, any>,
  ): Promise<boolean> {
    if (!call.contact_uuid || !call.contact || call.contact.do_not_call || !call.contact.phone) return false;

    const agentUuid: string = cfg.agent_uuid || call.agent_uuid;
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentUuid, company_uuid: call.company_uuid, deleted_at: null, status: AgentStatus.ACTIVE },
      select: { id: true },
    });
    if (!agent) return false;

    const duplicate = await this.prisma.scheduledCall.findFirst({
      where: {
        company_uuid: call.company_uuid,
        contact_uuid: call.contact_uuid,
        agent_uuid: agent.id,
        OR: [
          { origin_call_uuid: call.id, source: ScheduledCallSource.AUTOMATION },
          { status: ScheduledCallStatus.PENDING },
        ],
      },
      select: { id: true },
    });
    if (duplicate) return false;

    const delayMinutes =
      (cfg.delay_minutes ?? 0) + (cfg.delay_days ?? 0) * 1440 + (action.delay_minutes ?? 0);
    const scheduledFor = await this.callingHours.nextAllowedTime(
      call.company_uuid,
      new Date(Date.now() + delayMinutes * 60_000),
    );

    await this.prisma.scheduledCall.create({
      data: {
        company_uuid: call.company_uuid,
        agent_uuid: agent.id,
        contact_uuid: call.contact_uuid,
        origin_call_uuid: call.id,
        source: ScheduledCallSource.AUTOMATION,
        scheduled_for: scheduledFor,
      },
    });
    return true;
  }

  private async cancelFollowUps(call: LoadedCall): Promise<boolean> {
    if (!call.contact_uuid) return false;
    const result = await this.prisma.scheduledCall.updateMany({
      where: {
        company_uuid: call.company_uuid,
        contact_uuid: call.contact_uuid,
        status: ScheduledCallStatus.PENDING,
      },
      data: { status: ScheduledCallStatus.CANCELED, closed_reason: 'Closed by automation' },
    });
    return result.count > 0;
  }

  private buildContext(call: LoadedCall): TemplateContext {
    return {
      call: {
        id: call.id,
        call_number: call.call_number,
        status: call.status,
        direction: call.direction,
        summary: call.summary,
        outcome_key: call.outcome_key ?? call.outcome?.key ?? null,
        outcome_label: call.outcome_label ?? call.outcome?.label ?? null,
        is_successful: call.is_successful,
        duration_seconds: call.duration_seconds,
        attempt_number: call.attempt_number,
        started_at: iso(call.started_at),
        ended_at: iso(call.ended_at),
      },
      contact: {
        name: call.contact?.name ?? call.contact_name ?? null,
        phone: call.contact?.phone ?? call.to_number ?? null,
        email: call.contact?.email ?? null,
      },
      agent: { name: call.agent?.name ?? null },
      gathered:
        call.gathered_data && typeof call.gathered_data === 'object' && !Array.isArray(call.gathered_data)
          ? (call.gathered_data as Record<string, unknown>)
          : {},
    };
  }

  private basePayload(call: LoadedCall, rule: LoadedRule) {
    return {
      automation_rule_uuid: rule.id,
      contact_uuid: call.contact_uuid,
      external_id: call.contact?.external_id ?? null,
      record_type: call.contact?.record_type ?? null,
    };
  }

  private resolveStart(startFrom: string, ctx: TemplateContext, timezone: string): string | null {
    const raw = startFrom.startsWith('gathered.') ? String(readPath(ctx, startFrom) ?? '') : renderTemplate(startFrom, ctx);
    if (!raw) return null;
    const parsed = DateTime.fromISO(raw, { zone: timezone });
    return parsed.isValid ? parsed.toUTC().toISO() : null;
  }

  private webhookBody(call: LoadedCall, rule: LoadedRule, include: string[]) {
    const ctx = this.buildContext(call);
    const body: Record<string, unknown> = {
      event: { trigger: rule.trigger, rule_uuid: rule.id, occurred_at: new Date().toISOString() },
    };
    if (include.includes('call')) body.call = ctx.call;
    if (include.includes('contact')) body.contact = ctx.contact;
    if (include.includes('gathered')) body.gathered = ctx.gathered;
    if (include.includes('summary')) body.summary = call.summary;
    if (include.includes('transcript')) body.transcript = call.transcript_text;
    return body;
  }
}
