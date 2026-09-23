import { Injectable, Logger } from '@nestjs/common';
import {
  ActionKind,
  ActorType,
  AgentOutcome,
  AlertSeverity,
  AlertType,
  AutomationTrigger,
  Call,
  CallStatus,
  OutcomeSystemType,
  Prisma,
  ProcessingStatus,
  VoiceProvider,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CANONICAL_ACTION_KEYS } from '@/shared/constants/crm-fields';
import { PricingService } from '@/modules/call-engine/services/pricing.service';
import { CallActionsService } from '@/modules/call-engine/services/call-actions.service';
import { SchedulingService } from '@/modules/scheduling/scheduling.service';
import { AutomationService } from '@/modules/automation/automation.service';
import { CallMarkers, PRE_ANSWER_CALL_STATUSES } from '../calls.constants';
import { MappedCallEnd, VoiceCallPayload, VoiceWebhookEvent } from '../interfaces/calls.interface';
import {
  callDurationSeconds,
  mapCallEnd,
  msToDate,
  normalizeTranscript,
  transcriptToText,
} from '../utils/calls.utils';
import { CallRecordingsService } from './call-recordings.service';
import { CallTimelineService } from './call-timeline.service';
import { InboundCallService } from './inbound-call.service';

export interface ProcessResult {
  result: 'PROCESSED' | 'IGNORED';
  call_uuid?: string;
  note?: string;
}

const TRANSFER_MESSAGES: Record<string, string> = {
  transfer_started: 'Transfer to a team member started',
  transfer_bridged: 'Call transferred to a team member',
  transfer_cancelled: 'The transfer was not completed',
  transfer_ended: 'Transfer finished',
};

@Injectable()
export class CallProcessingService {
  private readonly logger = new Logger(CallProcessingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inbound: InboundCallService,
    private readonly recordings: CallRecordingsService,
    private readonly timeline: CallTimelineService,
    private readonly pricing: PricingService,
    private readonly actions: CallActionsService,
    private readonly scheduling: SchedulingService,
    private readonly automation: AutomationService,
    private readonly alerts: AlertsService,
    private readonly activity: ActivityLogService,
  ) {}

  /** Routes a verified provider event. Handlers are idempotent and tolerate any event order. */
  async process(event: VoiceWebhookEvent): Promise<ProcessResult> {
    const payload = event.call;
    if (!payload?.call_id) return { result: 'IGNORED', note: 'No call in event' };

    switch (event.event) {
      case 'call_started':
      case 'call_ended':
      case 'call_analyzed': {
        const call = await this.resolveCall(payload, true);
        if (!call) return { result: 'IGNORED', note: 'Call is not routed to an agent' };

        if (event.event === 'call_started') await this.handleStarted(call, payload);
        else if (event.event === 'call_ended') await this.handleEnded(call, payload);
        else await this.handleAnalyzed(call, payload);
        return { result: 'PROCESSED', call_uuid: call.id };
      }
      case 'transfer_started':
      case 'transfer_bridged':
      case 'transfer_cancelled':
      case 'transfer_ended': {
        const call = await this.resolveCall(payload, false);
        if (!call) return { result: 'IGNORED', note: 'Unknown call' };
        await this.handleTransferEvent(call, event);
        return { result: 'PROCESSED', call_uuid: call.id };
      }
      default:
        return { result: 'IGNORED', note: `Unhandled event ${event.event}` };
    }
  }

  // ------------------------------------------------------------ call lookup

  private async resolveCall(payload: VoiceCallPayload, allowCreate: boolean): Promise<Call | null> {
    const byExternal = await this.prisma.call.findFirst({
      where: { provider: VoiceProvider.RETELL, external_call_id: payload.call_id },
    });
    if (byExternal) return byExternal;

    const metadata = payload.metadata ?? {};
    const callUuid = typeof metadata.call_uuid === 'string' ? metadata.call_uuid : null;

    if (callUuid) {
      const byUuid = await this.prisma.call.findFirst({ where: { id: callUuid } });
      if (!byUuid) throw new Error(`Call ${callUuid} not found yet`);
      if (metadata.company_uuid && metadata.company_uuid !== byUuid.company_uuid) return null;

      if (!byUuid.external_call_id) {
        // The dialing request may not have stored the provider id yet.
        try {
          await this.prisma.call.updateMany({
            where: { id: byUuid.id, external_call_id: null },
            data: { external_call_id: payload.call_id },
          });
        } catch (error) {
          this.logger.warn(`Could not link call ${byUuid.id}: ${error?.message}`);
        }
        return this.prisma.call.findFirst({ where: { id: byUuid.id } });
      }
      return byUuid;
    }

    if (payload.direction === 'inbound' && allowCreate) {
      const created = await this.inbound.createInboundCall(payload);
      if (created) {
        await this.timeline.add(created.id, 'call.received', 'Inbound call received');
        await this.activity.log({
          company_uuid: created.company_uuid,
          actor_type: ActorType.SYSTEM,
          action: 'call.received',
          entity_type: 'call',
          entity_uuid: created.id,
        });
      }
      return created;
    }

    return null;
  }

  // --------------------------------------------------------------- handlers

  private async handleStarted(call: Call, payload: VoiceCallPayload): Promise<void> {
    const startedAt = msToDate(payload.start_timestamp) ?? new Date();

    const moved = await this.prisma.call.updateMany({
      where: { id: call.id, status: { in: PRE_ANSWER_CALL_STATUSES } },
      data: { status: CallStatus.IN_PROGRESS, started_at: startedAt, answered_at: startedAt },
    });

    if (moved.count > 0) {
      await this.timeline.add(call.id, 'call.started', 'Call connected');
    } else if (!call.started_at) {
      await this.prisma.call.updateMany({
        where: { id: call.id, started_at: null },
        data: { started_at: startedAt },
      });
    }
  }

  private async handleEnded(call: Call, payload: VoiceCallPayload): Promise<void> {
    const mapped = mapCallEnd(payload);
    const startedAt = msToDate(payload.start_timestamp);
    const endedAt = msToDate(payload.end_timestamp) ?? new Date();
    const duration = callDurationSeconds(payload);
    const answered = mapped.status === CallStatus.COMPLETED || mapped.status === CallStatus.TRANSFERRED;

    const segments = normalizeTranscript(payload.transcript_object);
    const transcriptText = payload.transcript || (segments.length ? transcriptToText(segments) : null);

    const data: Prisma.CallUncheckedUpdateInput = {
      status: mapped.status,
      ended_at: endedAt,
      duration_seconds: duration,
      disconnect_reason: payload.disconnection_reason ?? null,
    };
    if (!call.started_at && startedAt) data.started_at = startedAt;
    if (!call.answered_at && answered && startedAt) data.answered_at = startedAt;
    if (segments.length) data.transcript = segments as unknown as Prisma.InputJsonValue;
    if (transcriptText) data.transcript_text = transcriptText;
    if (mapped.in_voicemail !== undefined) data.in_voicemail = mapped.in_voicemail;
    if (payload.call_cost) data.provider_cost = payload.call_cost as Prisma.InputJsonValue;
    if (payload.agent_version !== undefined) data.provider_agent_version = payload.agent_version;
    if (mapped.error_code) {
      data.error_code = mapped.error_code;
      data.error_message = mapped.error_message ?? null;
    }
    if (mapped.status === CallStatus.TRANSFERRED) {
      data.transferred_to = payload.transfer_destination ?? call.transferred_to;
      data.transfer_reason =
        payload.collected_dynamic_variables?.transfer_reason ?? call.transfer_reason ?? null;
    }

    if (!call.outcome_uuid && mapped.system_outcome) {
      const outcome = await this.findSystemOutcome(call.agent_uuid, mapped.system_outcome);
      if (outcome) Object.assign(data, this.outcomeFields(outcome));
    }

    const updated = await this.prisma.call.update({ where: { id: call.id }, data });

    if (!(await this.timeline.has(call.id, 'call.ended'))) {
      await this.timeline.add(call.id, 'call.ended', this.endMessage(mapped), {
        status: mapped.status,
        duration_seconds: duration,
      } as Prisma.InputJsonValue);
    }

    await this.recordings.ingest(
      updated,
      payload.recording_url ?? payload.scrubbed_recording_url,
      duration,
    );

    if (await this.timeline.has(call.id, CallMarkers.FINISH_HANDLED)) return;
    await this.timeline.add(call.id, CallMarkers.FINISH_HANDLED);
    await this.runFinishSteps(updated, mapped);
  }

  private async runFinishSteps(call: Call, mapped: MappedCallEnd): Promise<void> {
    const isFailed = mapped.status === CallStatus.FAILED;

    await this.activity.log({
      company_uuid: call.company_uuid,
      actor_type: ActorType.SYSTEM,
      action: isFailed
        ? 'call.failed'
        : mapped.status === CallStatus.TRANSFERRED
          ? 'call.transferred'
          : 'call.ended',
      entity_type: 'call',
      entity_uuid: call.id,
      metadata: { status: mapped.status, error_code: mapped.error_code ?? null },
    });

    if (isFailed) {
      await this.alerts.raise({
        company_uuid: call.company_uuid,
        type: mapped.alert_type ?? AlertType.CALL_FAILED,
        severity: AlertSeverity.ERROR,
        title: mapped.alert_type === AlertType.INVALID_PHONE_NUMBER ? 'Invalid phone number' : 'Call failed',
        message: mapped.error_message ?? null,
        entity_type: 'call',
        entity_uuid: call.id,
      });
    }

    await this.safely(call.id, 'cost.failed', 'Call cost could not be calculated', async () => {
      await this.pricing.applyCosts(call.id);
    }, AlertType.OTHER);

    await this.safely(call.id, 'scheduling.failed', 'Follow-up scheduling failed', () =>
      this.scheduling.handleCallFinished(call.id),
    );

    if (!call.is_test) {
      const triggers: AutomationTrigger[] = [];
      if (mapped.status === CallStatus.COMPLETED) triggers.push(AutomationTrigger.CALL_COMPLETED);
      if (isFailed) triggers.push(AutomationTrigger.CALL_FAILED);
      if (mapped.status === CallStatus.TRANSFERRED) triggers.push(AutomationTrigger.CALL_TRANSFERRED);
      if (mapped.in_voicemail) triggers.push(AutomationTrigger.VOICEMAIL_DETECTED);

      for (const trigger of triggers) {
        await this.safely(call.id, 'automation.failed', 'An automation rule failed to run', () =>
          this.automation.runForCall(call.id, trigger),
        );
      }
    }

    // Unanswered dials get no analysis, so their outcome is finalized here.
    if (mapped.status === CallStatus.NO_ANSWER || mapped.status === CallStatus.BUSY) {
      await this.finalizeUnanswered(call.id);
    }
  }

  private async finalizeUnanswered(callUuid: string): Promise<void> {
    const claim = await this.prisma.call.updateMany({
      where: { id: callUuid, analysis_status: { in: [ProcessingStatus.PENDING, ProcessingStatus.FAILED] } },
      data: { analysis_status: ProcessingStatus.PROCESSING },
    });
    if (claim.count === 0) return;

    await this.runOutcomeSteps(callUuid);
    await this.prisma.call.update({
      where: { id: callUuid },
      data: { analysis_status: ProcessingStatus.COMPLETED },
    });
  }

  private async handleAnalyzed(call: Call, payload: VoiceCallPayload): Promise<void> {
    const claim = await this.prisma.call.updateMany({
      where: { id: call.id, analysis_status: { in: [ProcessingStatus.PENDING, ProcessingStatus.FAILED] } },
      data: { analysis_status: ProcessingStatus.PROCESSING },
    });
    if (claim.count === 0) return;

    try {
      const analysis = payload.call_analysis ?? {};
      const custom =
        analysis.custom_analysis_data && typeof analysis.custom_analysis_data === 'object'
          ? { ...analysis.custom_analysis_data }
          : {};
      const outcomeKey = typeof custom.outcome === 'string' ? custom.outcome : null;
      delete custom.outcome;

      const inVoicemail = analysis.in_voicemail ?? call.in_voicemail ?? false;
      const outcome = await this.resolveOutcome(call, outcomeKey, inVoicemail);

      const data: Prisma.CallUncheckedUpdateInput = {
        in_voicemail: inVoicemail,
        ...(outcome ? this.outcomeFields(outcome) : {}),
      };
      if (analysis.call_summary) data.summary = analysis.call_summary;
      if (Object.keys(custom).length) data.gathered_data = custom as Prisma.InputJsonValue;
      if (payload.call_cost) data.provider_cost = payload.call_cost as Prisma.InputJsonValue;

      await this.prisma.call.update({ where: { id: call.id }, data });
      await this.timeline.add(call.id, 'call.analyzed', 'Call analysis completed');

      const newlyVoicemail = inVoicemail && !call.in_voicemail;

      await this.safely(call.id, 'cost.failed', 'Call cost could not be calculated', async () => {
        await this.pricing.applyCosts(call.id);
      }, AlertType.OTHER);

      if (newlyVoicemail) await this.handleLateVoicemail(call.id);

      await this.runOutcomeSteps(call.id);

      await this.prisma.call.update({
        where: { id: call.id },
        data: { analysis_status: ProcessingStatus.COMPLETED },
      });
    } catch (error) {
      await this.prisma.call.updateMany({
        where: { id: call.id, analysis_status: ProcessingStatus.PROCESSING },
        data: { analysis_status: ProcessingStatus.FAILED },
      });
      await this.timeline.add(call.id, 'analysis.failed', 'Call analysis could not be processed');
      throw error;
    }
  }

  /** Voicemail found by the analysis after the call was already closed out as answered. */
  private async handleLateVoicemail(callUuid: string): Promise<void> {
    const fresh = await this.prisma.call.findUnique({
      where: { id: callUuid },
      select: { is_test: true, status: true },
    });
    if (!fresh) return;

    const finished = await this.timeline.has(callUuid, CallMarkers.FINISH_HANDLED);
    if (finished) {
      await this.safely(callUuid, 'scheduling.failed', 'Follow-up scheduling failed', () =>
        this.scheduling.handleCallFinished(callUuid),
      );
    }
    if (!fresh.is_test && !(await this.timeline.has(callUuid, 'voicemail.detected'))) {
      await this.timeline.add(callUuid, 'voicemail.detected', 'Voicemail detected');
      await this.safely(callUuid, 'automation.failed', 'An automation rule failed to run', () =>
        this.automation.runForCall(callUuid, AutomationTrigger.VOICEMAIL_DETECTED),
      );
    }
  }

  /** CRM update + outcome automations, each at most once per call. */
  private async runOutcomeSteps(callUuid: string): Promise<void> {
    const call = await this.prisma.call.findUnique({
      where: { id: callUuid },
      include: { agent: { select: { crm_integration_uuid: true } } },
    });
    if (!call || call.is_test) return;

    const integrationUuid = call.agent?.crm_integration_uuid;
    if (integrationUuid && call.contact_uuid) {
      const existing = await this.prisma.callAction.findFirst({
        where: { call_uuid: callUuid, tool_key: CANONICAL_ACTION_KEYS.CRM_SYNC_CALL_RESULT },
        select: { id: true },
      });
      if (!existing) {
        await this.safely(
          callUuid,
          'crm_sync.request_failed',
          'The CRM update could not be started',
          async () => {
            await this.actions.requestAction({
              company_uuid: call.company_uuid,
              call_uuid: call.id,
              source: 'SYSTEM',
              tool_key: CANONICAL_ACTION_KEYS.CRM_SYNC_CALL_RESULT,
              kind: ActionKind.CRM,
              agent_uuid: call.agent_uuid,
              integration_uuid: integrationUuid,
              payload: { contact_uuid: call.contact_uuid },
            });
          },
          AlertType.CRM_UPDATE_FAILED,
        );
      }
    }

    if (!(await this.timeline.has(callUuid, CallMarkers.OUTCOME_AUTOMATION))) {
      await this.timeline.add(callUuid, CallMarkers.OUTCOME_AUTOMATION);
      await this.safely(callUuid, 'automation.failed', 'An automation rule failed to run', () =>
        this.automation.runForCall(callUuid, AutomationTrigger.CALL_OUTCOME),
      );
    }
  }

  private async handleTransferEvent(call: Call, event: VoiceWebhookEvent): Promise<void> {
    const destination = event.transfer_destination ?? event.call?.transfer_destination ?? null;
    await this.timeline.add(
      call.id,
      `call.${event.event}`,
      TRANSFER_MESSAGES[event.event] ?? 'Transfer update',
    );
    if (destination && !call.transferred_to) {
      await this.prisma.call.updateMany({
        where: { id: call.id, transferred_to: null },
        data: { transferred_to: destination },
      });
    }
  }

  // ---------------------------------------------------------------- helpers

  private async resolveOutcome(
    call: Call,
    outcomeKey: string | null,
    inVoicemail: boolean,
  ): Promise<AgentOutcome | null> {
    const outcomes = await this.prisma.agentOutcome.findMany({ where: { agent_uuid: call.agent_uuid } });
    const bySystem = (type: OutcomeSystemType) => outcomes.find((o) => o.system_type === type) ?? null;

    if (inVoicemail) {
      const voicemail = bySystem(OutcomeSystemType.VOICEMAIL);
      if (voicemail) return voicemail;
    }

    if (outcomeKey) {
      const wanted = outcomeKey.trim().toLowerCase();
      const match = outcomes.find(
        (o) => o.key.toLowerCase() === wanted || o.label.toLowerCase() === wanted,
      );
      if (match) return match;
    }

    if (call.outcome_uuid) {
      const existing = outcomes.find((o) => o.id === call.outcome_uuid);
      if (existing) return existing;
    }

    return bySystem(OutcomeSystemType.UNKNOWN);
  }

  private async findSystemOutcome(agentUuid: string, type: OutcomeSystemType): Promise<AgentOutcome | null> {
    return this.prisma.agentOutcome.findFirst({ where: { agent_uuid: agentUuid, system_type: type } });
  }

  private outcomeFields(outcome: AgentOutcome): Prisma.CallUncheckedUpdateInput {
    return {
      outcome_uuid: outcome.id,
      outcome_key: outcome.key,
      outcome_label: outcome.label,
      is_successful: outcome.system_type === OutcomeSystemType.UNKNOWN ? null : outcome.is_success,
    };
  }

  private endMessage(mapped: MappedCallEnd): string {
    switch (mapped.status) {
      case CallStatus.TRANSFERRED:
        return 'Call ended after being transferred to a team member';
      case CallStatus.NO_ANSWER:
        return 'Call ended without an answer';
      case CallStatus.BUSY:
        return 'Line was busy';
      case CallStatus.FAILED:
        return mapped.error_message ?? 'Call failed';
      case CallStatus.CANCELED:
        return 'Call was canceled';
      default:
        return mapped.in_voicemail ? 'Call ended at voicemail' : 'Call ended';
    }
  }

  /** Runs a downstream step; a failure is recorded but never hides or rolls back the call (spec §33). */
  private async safely(
    callUuid: string,
    eventType: string,
    message: string,
    step: () => Promise<unknown>,
    alertType?: AlertType,
  ): Promise<void> {
    try {
      await step();
    } catch (error) {
      this.logger.error(`${eventType} for call ${callUuid}: ${error?.message}`);
      await this.timeline.add(callUuid, eventType, message);
      if (alertType) {
        const call = await this.prisma.call.findUnique({
          where: { id: callUuid },
          select: { company_uuid: true },
        });
        if (call) {
          await this.alerts.raise({
            company_uuid: call.company_uuid,
            type: alertType,
            severity: AlertSeverity.WARNING,
            title: message,
            entity_type: 'call',
            entity_uuid: callUuid,
          });
        }
      }
    }
  }
}
