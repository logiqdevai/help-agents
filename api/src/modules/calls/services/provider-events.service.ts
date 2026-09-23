import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, ProcessingStatus, ProviderEventStatus, VoiceProvider } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { EVENT_SWEEP_MIN_AGE_MS, MAX_EVENT_ATTEMPTS, STUCK_ANALYSIS_AGE_MS } from '../calls.constants';
import { VoiceWebhookEvent } from '../interfaces/calls.interface';
import { CallProcessingService } from './call-processing.service';

const OPEN_STATUSES: ProviderEventStatus[] = [ProviderEventStatus.RECEIVED, ProviderEventStatus.FAILED];

/** Inbox of verified provider webhooks: stored first, then processed idempotently with retries. */
@Injectable()
export class ProviderEventsService {
  private readonly logger = new Logger(ProviderEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processing: CallProcessingService,
  ) {}

  /** Stores a verified event and processes it in the background. Duplicates are ignored. */
  async ingest(
    event: VoiceWebhookEvent,
    options: { dedupeKey?: string } = {},
  ): Promise<{ id: string | null; duplicate: boolean }> {
    const callId = event.call?.call_id ?? null;
    const dedupeKey = options.dedupeKey ?? (callId ? `${event.event}:${callId}` : null);

    let id: string;
    try {
      const created = await this.prisma.providerEvent.create({
        data: {
          provider: VoiceProvider.RETELL,
          event_type: event.event,
          dedupe_key: dedupeKey,
          external_call_id: callId,
          payload: event as unknown as Prisma.InputJsonValue,
          signature_verified: true,
        },
        select: { id: true },
      });
      id = created.id;
    } catch (error) {
      if (error?.code === 'P2002') return { id: null, duplicate: true };
      throw error;
    }

    setImmediate(() => {
      this.processById(id).catch((error) =>
        this.logger.error(`Processing provider event ${id} failed: ${error?.message}`),
      );
    });
    return { id, duplicate: false };
  }

  async processById(id: string): Promise<void> {
    const event = await this.prisma.providerEvent.findUnique({ where: { id } });
    if (!event || !OPEN_STATUSES.includes(event.status) || event.attempts >= MAX_EVENT_ATTEMPTS) return;

    const claimed = await this.prisma.providerEvent.updateMany({
      where: { id, attempts: event.attempts, status: { in: OPEN_STATUSES } },
      data: { attempts: { increment: 1 } },
    });
    if (claimed.count === 0) return;

    try {
      const result = await this.processing.process(event.payload as unknown as VoiceWebhookEvent);
      await this.prisma.providerEvent.update({
        where: { id },
        data: {
          status: result.result === 'IGNORED' ? ProviderEventStatus.IGNORED : ProviderEventStatus.PROCESSED,
          call_uuid: result.call_uuid ?? null,
          error: result.note ?? null,
          processed_at: new Date(),
        },
      });
    } catch (error) {
      const message = String(error?.message ?? error).slice(0, 1000);
      this.logger.error(`Provider event ${id} (${event.event_type}) failed: ${message}`);
      await this.prisma.providerEvent.update({
        where: { id },
        data: { status: ProviderEventStatus.FAILED, error: message },
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    try {
      await this.prisma.call.updateMany({
        where: {
          analysis_status: ProcessingStatus.PROCESSING,
          updated_at: { lt: new Date(Date.now() - STUCK_ANALYSIS_AGE_MS) },
        },
        data: { analysis_status: ProcessingStatus.PENDING },
      });

      const pending = await this.prisma.providerEvent.findMany({
        where: {
          status: { in: OPEN_STATUSES },
          attempts: { lt: MAX_EVENT_ATTEMPTS },
          received_at: { lt: new Date(Date.now() - EVENT_SWEEP_MIN_AGE_MS) },
        },
        orderBy: { received_at: 'asc' },
        select: { id: true },
        take: 50,
      });

      for (const { id } of pending) await this.processById(id);
    } catch (error) {
      this.logger.error(`Provider event sweep failed: ${error?.message}`);
    }
  }
}
