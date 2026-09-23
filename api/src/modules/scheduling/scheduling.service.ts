import { Injectable, Logger } from '@nestjs/common';
import {
  ActorType,
  AgentStatus,
  CallDirection,
  CallStatus,
  OutcomeSystemType,
  RetryTrigger,
  ScheduledCallSource,
  ScheduledCallStatus,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CallingHoursService } from '@/modules/call-engine/services/calling-hours.service';
import { CallingHoursOverride } from '@/modules/call-engine/interfaces/call-engine.interface';
import { delayForAttempt } from './utils/scheduling.utils';

const FINAL_STATUSES: CallStatus[] = [
  CallStatus.COMPLETED,
  CallStatus.TRANSFERRED,
  CallStatus.NO_ANSWER,
  CallStatus.BUSY,
  CallStatus.FAILED,
  CallStatus.CANCELED,
];
const OPEN_SCHEDULED: ScheduledCallStatus[] = [ScheduledCallStatus.PENDING, ScheduledCallStatus.IN_PROGRESS];
const TRANSFER_FAILED_RE = /transfer.*(fail|unavailable|no_answer|busy|timeout|declin)/i;
const TRANSFER_FOLLOW_UP_DELAY_MINUTES = 60;

/**
 * Scheduled calls + retry rules (spec §26-28). Retries are driven by the call outcome;
 * the dispatcher (SchedulingDispatcherService) places the calls.
 */
@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly callingHours: CallingHoursService,
    private readonly activity: ActivityLogService,
  ) {}

  /** Called by call processing once a call reaches a final status. Never throws. */
  async handleCallFinished(callUuid: string): Promise<void> {
    try {
      await this.process(callUuid);
    } catch (error) {
      this.logger.error(`handleCallFinished(${callUuid}) failed: ${error?.message}`);
    }
  }

  private async process(callUuid: string): Promise<void> {
    const call = await this.prisma.call.findUnique({
      where: { id: callUuid },
      include: {
        outcome: true,
        contact: true,
        agent: { include: { retry_rule: true } },
      },
    });
    if (!call || call.is_test || !FINAL_STATUSES.includes(call.status)) return;

    if (call.status === CallStatus.CANCELED) {
      await this.closeOrigin(call.scheduled_call_uuid, ScheduledCallStatus.CANCELED, 'Call canceled');
      return;
    }

    const trigger = this.resolveTrigger(call);

    if (!trigger) {
      await this.closeOrigin(call.scheduled_call_uuid, ScheduledCallStatus.COMPLETED, 'Call answered');
      if (call.contact_uuid) {
        await this.cancelPendingRetries(call.company_uuid, call.contact_uuid, call.agent_uuid);
      }
      if (TRANSFER_FAILED_RE.test(call.disconnect_reason ?? '')) {
        await this.createTransferFollowUp(call);
      }
      return;
    }

    const closeStatus =
      trigger === RetryTrigger.FAILED ? ScheduledCallStatus.FAILED : ScheduledCallStatus.COMPLETED;
    const rule = call.agent?.retry_rule;
    const label = trigger.toLowerCase();

    const eligible =
      call.direction === CallDirection.OUTBOUND &&
      !!call.contact &&
      !call.contact.do_not_call &&
      !!call.agent &&
      !call.agent.deleted_at &&
      call.agent.status === AgentStatus.ACTIVE;

    if (!eligible || !rule?.is_enabled) {
      await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: retries not enabled`);
      return;
    }
    if (!rule.retry_on.includes(trigger)) {
      await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: not configured for retry`);
      return;
    }
    if (call.attempt_number >= rule.max_attempts) {
      await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: max attempts reached`);
      return;
    }

    const alreadyRetried = await this.prisma.scheduledCall.findFirst({
      where: { origin_call_uuid: call.id },
      select: { id: true },
    });
    if (alreadyRetried) {
      await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: retry scheduled`);
      return;
    }

    const pending = await this.prisma.scheduledCall.findFirst({
      where: {
        company_uuid: call.company_uuid,
        contact_uuid: call.contact_uuid,
        agent_uuid: call.agent_uuid,
        status: ScheduledCallStatus.PENDING,
        id: { not: call.scheduled_call_uuid ?? undefined },
      },
      select: { id: true },
    });
    if (pending) {
      await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: another call already pending`);
      return;
    }

    const wait = delayForAttempt(rule.delays_minutes, call.attempt_number);
    const scheduledFor = await this.callingHours.nextAllowedTime(
      call.company_uuid,
      new Date(Date.now() + wait * 60_000),
      (rule.calling_hours_override as unknown as CallingHoursOverride | null) ?? null,
    );

    const retry = await this.prisma.scheduledCall.create({
      data: {
        company_uuid: call.company_uuid,
        agent_uuid: call.agent_uuid,
        contact_uuid: call.contact_uuid,
        origin_call_uuid: call.id,
        source: ScheduledCallSource.RETRY,
        status: ScheduledCallStatus.PENDING,
        attempt_number: call.attempt_number + 1,
        scheduled_for: scheduledFor,
      },
    });

    await this.closeOrigin(call.scheduled_call_uuid, closeStatus, `${label}: retry scheduled`);
    await this.activity.log({
      company_uuid: call.company_uuid,
      actor_type: ActorType.SYSTEM,
      action: 'scheduled_call.retry_scheduled',
      entity_type: 'scheduled_call',
      entity_uuid: retry.id,
      metadata: {
        call_uuid: call.id,
        attempt_number: retry.attempt_number,
        scheduled_for: scheduledFor.toISOString(),
        trigger,
      },
    });
  }

  private resolveTrigger(call: {
    status: CallStatus;
    in_voicemail: boolean | null;
    outcome: { system_type: OutcomeSystemType | null } | null;
  }): RetryTrigger | null {
    if (call.in_voicemail === true || call.outcome?.system_type === OutcomeSystemType.VOICEMAIL) {
      return RetryTrigger.VOICEMAIL;
    }
    switch (call.status) {
      case CallStatus.NO_ANSWER:
        return RetryTrigger.NO_ANSWER;
      case CallStatus.BUSY:
        return RetryTrigger.BUSY;
      case CallStatus.FAILED:
        return RetryTrigger.FAILED;
      default:
        return null;
    }
  }

  private async closeOrigin(
    scheduledCallUuid: string | null,
    status: ScheduledCallStatus,
    reason: string,
  ): Promise<void> {
    if (!scheduledCallUuid) return;
    await this.prisma.scheduledCall.updateMany({
      where: { id: scheduledCallUuid, status: { in: OPEN_SCHEDULED } },
      data: { status, closed_reason: reason },
    });
  }

  private async cancelPendingRetries(companyUuid: string, contactUuid: string, agentUuid: string) {
    await this.prisma.scheduledCall.updateMany({
      where: {
        company_uuid: companyUuid,
        contact_uuid: contactUuid,
        agent_uuid: agentUuid,
        source: ScheduledCallSource.RETRY,
        status: ScheduledCallStatus.PENDING,
      },
      data: { status: ScheduledCallStatus.CANCELED, closed_reason: 'Contact reached' },
    });
  }

  /** §10: nobody took the transferred call, so the customer is called back instead of being left stuck. */
  private async createTransferFollowUp(call: {
    id: string;
    company_uuid: string;
    agent_uuid: string;
    contact_uuid: string | null;
    contact: { do_not_call: boolean } | null;
  }): Promise<void> {
    if (!call.contact_uuid || call.contact?.do_not_call) return;

    const existing = await this.prisma.scheduledCall.findFirst({
      where: {
        OR: [
          { origin_call_uuid: call.id },
          {
            company_uuid: call.company_uuid,
            contact_uuid: call.contact_uuid,
            agent_uuid: call.agent_uuid,
            status: ScheduledCallStatus.PENDING,
          },
        ],
      },
      select: { id: true },
    });
    if (existing) return;

    const scheduledFor = await this.callingHours.nextAllowedTime(
      call.company_uuid,
      new Date(Date.now() + TRANSFER_FOLLOW_UP_DELAY_MINUTES * 60_000),
    );
    const followUp = await this.prisma.scheduledCall.create({
      data: {
        company_uuid: call.company_uuid,
        agent_uuid: call.agent_uuid,
        contact_uuid: call.contact_uuid,
        origin_call_uuid: call.id,
        source: ScheduledCallSource.FOLLOW_UP,
        scheduled_for: scheduledFor,
      },
    });

    await this.activity.log({
      company_uuid: call.company_uuid,
      actor_type: ActorType.SYSTEM,
      action: 'scheduled_call.transfer_follow_up_created',
      entity_type: 'scheduled_call',
      entity_uuid: followUp.id,
      metadata: { call_uuid: call.id },
    });
  }
}
