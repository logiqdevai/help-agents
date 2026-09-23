import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActorType, AgentStatus, AlertSeverity, AlertType, ScheduledCallStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { CallPlacementErrorCodes } from '@/modules/call-engine/call-engine.constants';
import { CallPlacementService } from '@/modules/call-engine/services/call-placement.service';
import { CallingHoursService } from '@/modules/call-engine/services/calling-hours.service';

const BATCH_SIZE = 25;
const STUCK_AFTER_MS = 15 * 60 * 1000;
const TRANSIENT_RETRY_MS = 5 * 60 * 1000;
const MAX_DISPATCH_TRIES = 3;
const DISPATCH_FAILED_ACTION = 'scheduled_call.dispatch_failed';

/** Places calls for due ScheduledCalls (spec §26). */
@Injectable()
export class SchedulingDispatcherService {
  private readonly logger = new Logger(SchedulingDispatcherService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly placement: CallPlacementService,
    private readonly callingHours: CallingHoursService,
    private readonly alerts: AlertsService,
    private readonly activity: ActivityLogService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.reclaimStuck();
      await this.dispatchDue();
    } catch (error) {
      this.logger.error(`Scheduling dispatcher failed: ${error?.message}`);
    } finally {
      this.running = false;
    }
  }

  private async reclaimStuck(): Promise<void> {
    const stuck = await this.prisma.scheduledCall.findMany({
      where: {
        status: ScheduledCallStatus.IN_PROGRESS,
        updated_at: { lt: new Date(Date.now() - STUCK_AFTER_MS) },
        call: { is: null },
      },
      take: BATCH_SIZE,
    });

    for (const sc of stuck) {
      const claimed = await this.prisma.scheduledCall.updateMany({
        where: { id: sc.id, status: ScheduledCallStatus.IN_PROGRESS, updated_at: sc.updated_at },
        data: { status: ScheduledCallStatus.PENDING },
      });
      if (claimed.count) {
        await this.recordFailure(sc.company_uuid, sc.id, 'stuck_in_progress');
      }
    }
  }

  private async dispatchDue(): Promise<void> {
    const due = await this.prisma.scheduledCall.findMany({
      where: { status: ScheduledCallStatus.PENDING, scheduled_for: { lte: new Date() } },
      orderBy: { scheduled_for: 'asc' },
      take: BATCH_SIZE,
    });

    for (const candidate of due) {
      const claimed = await this.prisma.scheduledCall.updateMany({
        where: { id: candidate.id, status: ScheduledCallStatus.PENDING },
        data: { status: ScheduledCallStatus.IN_PROGRESS },
      });
      if (claimed.count === 0) continue;

      try {
        await this.dispatchOne(candidate.id);
      } catch (error) {
        this.logger.error(`Dispatch of scheduled call ${candidate.id} crashed: ${error?.message}`);
        await this.close(candidate.id, ScheduledCallStatus.FAILED, 'Unexpected dispatch error');
      }
    }
  }

  private async dispatchOne(id: string): Promise<void> {
    const sc = await this.prisma.scheduledCall.findUnique({
      where: { id },
      include: { agent: true, contact: true },
    });
    if (!sc) return;

    if (!sc.agent || sc.agent.deleted_at || sc.agent.status !== AgentStatus.ACTIVE) {
      return this.close(id, ScheduledCallStatus.SKIPPED, 'Agent is not active');
    }
    if (!sc.contact || sc.contact.do_not_call) {
      return this.close(id, ScheduledCallStatus.SKIPPED, 'Contact is marked do-not-call');
    }

    try {
      await this.placement.placeCall({
        company_uuid: sc.company_uuid,
        agent_uuid: sc.agent_uuid,
        contact_uuid: sc.contact_uuid,
        scheduled_call_uuid: sc.id,
        attempt_number: sc.attempt_number,
      });
    } catch (error) {
      await this.handlePlacementError(sc, error);
    }
  }

  private async handlePlacementError(
    sc: { id: string; company_uuid: string; agent_uuid: string; contact_uuid: string },
    error: unknown,
  ): Promise<void> {
    const code = this.errorCode(error);
    const message = this.errorMessage(error);

    switch (code) {
      case CallPlacementErrorCodes.OUTSIDE_CALLING_HOURS: {
        const next = await this.callingHours.nextAllowedTime(sc.company_uuid, new Date(Date.now() + 60_000));
        await this.prisma.scheduledCall.updateMany({
          where: { id: sc.id, status: ScheduledCallStatus.IN_PROGRESS },
          data: { status: ScheduledCallStatus.PENDING, scheduled_for: next },
        });
        return;
      }

      case CallPlacementErrorCodes.CONTACT_DO_NOT_CALL:
      case CallPlacementErrorCodes.AGENT_NOT_ACTIVE:
      case CallPlacementErrorCodes.INVALID_PHONE_NUMBER:
      case CallPlacementErrorCodes.CONTACT_NOT_FOUND:
        return this.close(sc.id, ScheduledCallStatus.SKIPPED, code);

      case CallPlacementErrorCodes.PROVIDER_UNAVAILABLE:
      case CallPlacementErrorCodes.AGENT_NOT_SYNCED: {
        await this.recordFailure(sc.company_uuid, sc.id, code);
        const tries = await this.prisma.activityLog.count({
          where: {
            company_uuid: sc.company_uuid,
            entity_type: 'scheduled_call',
            entity_uuid: sc.id,
            action: DISPATCH_FAILED_ACTION,
          },
        });
        if (tries < MAX_DISPATCH_TRIES) {
          await this.prisma.scheduledCall.updateMany({
            where: { id: sc.id, status: ScheduledCallStatus.IN_PROGRESS },
            data: {
              status: ScheduledCallStatus.PENDING,
              scheduled_for: new Date(Date.now() + TRANSIENT_RETRY_MS),
            },
          });
          return;
        }
        return this.fail(sc, `${code}: gave up after ${tries} tries`, message);
      }

      default:
        return this.fail(sc, code ?? 'PLACEMENT_FAILED', message);
    }
  }

  private async fail(
    sc: { id: string; company_uuid: string; agent_uuid: string },
    reason: string,
    detail: string,
  ): Promise<void> {
    await this.close(sc.id, ScheduledCallStatus.FAILED, reason);
    await this.alerts.raise({
      company_uuid: sc.company_uuid,
      type: AlertType.CALL_FAILED,
      severity: AlertSeverity.ERROR,
      title: 'Scheduled call could not be placed',
      message: detail,
      entity_type: 'scheduled_call',
      entity_uuid: sc.id,
      metadata: { agent_uuid: sc.agent_uuid, reason },
    });
  }

  private async close(id: string, status: ScheduledCallStatus, reason: string): Promise<void> {
    await this.prisma.scheduledCall.updateMany({
      where: { id, status: ScheduledCallStatus.IN_PROGRESS },
      data: { status, closed_reason: reason.slice(0, 500) },
    });
  }

  private recordFailure(companyUuid: string, id: string, code: string) {
    return this.activity.log({
      company_uuid: companyUuid,
      actor_type: ActorType.SYSTEM,
      action: DISPATCH_FAILED_ACTION,
      entity_type: 'scheduled_call',
      entity_uuid: id,
      metadata: { code },
    });
  }

  private errorCode(error: unknown): string | undefined {
    if (error instanceof HttpException) {
      const body = error.getResponse();
      if (body && typeof body === 'object' && typeof (body as any).code === 'string') {
        return (body as any).code;
      }
    }
    return undefined;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpException) {
      const body = error.getResponse();
      if (body && typeof body === 'object' && typeof (body as any).message === 'string') {
        return (body as any).message;
      }
    }
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
