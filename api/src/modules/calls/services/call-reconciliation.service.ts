import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ActorType, AlertSeverity, AlertType, CallStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { SchedulingService } from '@/modules/scheduling/scheduling.service';
import { LIVE_CALL_STATUSES, STUCK_CALL_AGE_MS } from '../calls.constants';
import { VoiceCallPayload } from '../interfaces/calls.interface';
import { CallTimelineService } from './call-timeline.service';
import { ProviderEventsService } from './provider-events.service';

const PROVIDER_ENDED_STATES = ['ended', 'error', 'not_connected'];

/** Recovers calls whose end-of-call webhooks never arrived. */
@Injectable()
export class CallReconciliationService {
  private readonly logger = new Logger(CallReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: VoiceProviderService,
    private readonly events: ProviderEventsService,
    private readonly timeline: CallTimelineService,
    private readonly alerts: AlertsService,
    private readonly activity: ActivityLogService,
    private readonly scheduling: SchedulingService,
  ) {}

  @Cron('0 */10 * * * *')
  async reconcileStuckCalls(): Promise<void> {
    try {
      const stuck = await this.prisma.call.findMany({
        where: {
          status: { in: LIVE_CALL_STATUSES },
          external_call_id: { not: null },
          created_at: { lt: new Date(Date.now() - STUCK_CALL_AGE_MS) },
        },
        select: { id: true, company_uuid: true, external_call_id: true },
        orderBy: { created_at: 'asc' },
        take: 25,
      });

      for (const call of stuck) {
        await this.reconcile(call).catch((error) =>
          this.logger.error(`Reconciling call ${call.id} failed: ${error?.message}`),
        );
      }
    } catch (error) {
      this.logger.error(`Stuck call reconciliation failed: ${error?.message}`);
    }
  }

  private async reconcile(call: { id: string; company_uuid: string; external_call_id: string }): Promise<void> {
    let payload: VoiceCallPayload | null = null;

    try {
      payload = (await this.voice.getCall(call.external_call_id)) as VoiceCallPayload;
    } catch (error) {
      const notFound = error instanceof HttpException && error.getStatus() === 404;
      if (!notFound) throw error;
    }

    if (payload && PROVIDER_ENDED_STATES.includes(String(payload.call_status))) {
      await this.events.ingest(
        { event: 'call_ended', call: payload },
        { dedupeKey: `reconcile:call_ended:${payload.call_id}` },
      );
      if (payload.call_analysis) {
        await this.events.ingest(
          { event: 'call_analyzed', call: payload },
          { dedupeKey: `reconcile:call_analyzed:${payload.call_id}` },
        );
      }
      await this.timeline.add(call.id, 'call.reconciled', 'Call result recovered');
      return;
    }

    const closed = await this.prisma.call.updateMany({
      where: { id: call.id, status: { in: LIVE_CALL_STATUSES } },
      data: {
        status: CallStatus.FAILED,
        error_code: 'STUCK',
        error_message: 'The call did not finish and was closed automatically',
        ended_at: new Date(),
      },
    });
    if (closed.count === 0) return;

    await this.timeline.add(call.id, 'call.closed', 'The call did not finish and was closed automatically');
    await this.activity.log({
      company_uuid: call.company_uuid,
      actor_type: ActorType.SYSTEM,
      action: 'call.failed',
      entity_type: 'call',
      entity_uuid: call.id,
      metadata: { error_code: 'STUCK' },
    });
    await this.alerts.raise({
      company_uuid: call.company_uuid,
      type: AlertType.CALL_FAILED,
      severity: AlertSeverity.ERROR,
      title: 'Call failed',
      message: 'The call did not finish and was closed automatically',
      entity_type: 'call',
      entity_uuid: call.id,
    });
    await this.scheduling.handleCallFinished(call.id);
  }
}
