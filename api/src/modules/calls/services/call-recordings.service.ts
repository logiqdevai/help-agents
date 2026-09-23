import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service';
import { GcsFolders } from '@/integrations/storage/gcs/config/gcs-folders.config';
import { CallTimelineService } from './call-timeline.service';
import { RECORDING_DOWNLOAD_TIMEOUT_MS, RECORDING_MAX_BYTES } from '../calls.constants';
import { splitStoragePath } from '../utils/calls.utils';

@Injectable()
export class CallRecordingsService {
  private readonly logger = new Logger(CallRecordingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gcs: GcsService,
    private readonly timeline: CallTimelineService,
  ) {}

  /**
   * Copies the provider recording into our own storage. Failures are logged on the call
   * timeline and never propagate — the call itself must still be saved (spec §33).
   */
  async ingest(
    call: { id: string; company_uuid: string; recording_path: string | null; ended_at: Date | null },
    recordingUrl: string | undefined | null,
    durationSeconds: number | null,
  ): Promise<void> {
    if (!recordingUrl || call.recording_path) return;

    try {
      const response = await axios.get<ArrayBuffer>(recordingUrl, {
        responseType: 'arraybuffer',
        timeout: RECORDING_DOWNLOAD_TIMEOUT_MS,
        maxContentLength: RECORDING_MAX_BYTES,
      });
      const contentType = String(response.headers['content-type'] ?? 'audio/wav').split(';')[0];
      const ext = contentType.includes('mpeg') || contentType.includes('mp3') ? 'mp3' : 'wav';

      const uploaded = await this.gcs.uploadImageFromBuffer(
        Buffer.from(response.data),
        `${call.id}.${ext}`,
        contentType,
        GcsFolders.recordings,
      );

      const company = await this.prisma.company.findUnique({
        where: { id: call.company_uuid },
        select: { recording_retention_days: true },
      });
      const retentionDays = company?.recording_retention_days;
      const base = call.ended_at ?? new Date();

      await this.prisma.call.update({
        where: { id: call.id },
        data: {
          recording_path: uploaded.path,
          recording_duration_seconds: durationSeconds,
          recording_expires_at: retentionDays
            ? new Date(base.getTime() + retentionDays * 24 * 60 * 60 * 1000)
            : null,
        },
      });
      await this.timeline.add(call.id, 'recording.stored', 'Call recording stored');
    } catch (error) {
      this.logger.error(`Recording ingest failed for call ${call.id}: ${error?.message}`);
      await this.timeline.add(call.id, 'recording.failed', 'The call recording could not be stored');
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpired(): Promise<void> {
    try {
      const expired = await this.prisma.call.findMany({
        where: {
          recording_expires_at: { lte: new Date() },
          recording_deleted_at: null,
          recording_path: { not: null },
        },
        select: { id: true, recording_path: true },
        take: 100,
      });

      for (const call of expired) {
        const claimed = await this.prisma.call.updateMany({
          where: { id: call.id, recording_deleted_at: null, recording_path: call.recording_path },
          data: { recording_deleted_at: new Date() },
        });
        if (claimed.count === 0) continue;

        try {
          await this.gcs.deleteImage({ filename: call.recording_path });
        } catch (error) {
          const message = String(error?.message ?? '');
          if (!/no such object|not found|404/i.test(message)) {
            await this.prisma.call.update({ where: { id: call.id }, data: { recording_deleted_at: null } });
            this.logger.error(`Failed to delete recording of call ${call.id}: ${message}`);
            continue;
          }
        }

        await this.prisma.call.update({ where: { id: call.id }, data: { recording_path: null } });
        await this.timeline.add(call.id, 'recording.deleted', 'Recording removed after the retention period');
      }
    } catch (error) {
      this.logger.error(`Recording retention job failed: ${error?.message}`);
    }
  }

  async getSignedUrl(path: string, ttlMinutes: number): Promise<string> {
    const { folder, filename } = splitStoragePath(path);
    return this.gcs.getSignedUrl(filename, folder || undefined, ttlMinutes);
  }
}
