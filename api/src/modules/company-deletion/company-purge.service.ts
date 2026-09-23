import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthRole, PhoneNumberStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import {
  DELETION_GRACE_DAYS,
  MAX_COMPANIES_PER_RUN,
  PURGE_BATCH_SIZE,
  STALLED_PURGE_MS,
  STORAGE_DELETE_CONCURRENCY,
} from './company-deletion.constants';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Permanently deletes companies whose deletion grace period has elapsed (spec §39). */
@Injectable()
export class CompanyPurgeService {
  private readonly logger = new Logger(CompanyPurgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: VoiceProviderService,
    private readonly gcs: GcsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    try {
      await this.purgeDue();
    } catch (error) {
      this.logger.error(`Company purge run failed: ${error?.message}`);
    }
  }

  async purgeDue(): Promise<number> {
    const now = Date.now();
    const due = await this.prisma.company.findMany({
      where: {
        deletion_requested_at: { lte: new Date(now - DELETION_GRACE_DAYS * DAY_MS) },
        OR: [{ deleted_at: null }, { deleted_at: { lt: new Date(now - STALLED_PURGE_MS) } }],
      },
      select: { id: true },
      orderBy: { deletion_requested_at: 'asc' },
      take: MAX_COMPANIES_PER_RUN,
    });

    let purged = 0;
    for (const { id } of due) {
      try {
        if (await this.purgeCompany(id)) purged++;
      } catch (error) {
        this.logger.error(`Failed to purge company ${id}: ${error?.message}`);
      }
    }
    return purged;
  }

  /**
   * Returns false when the company is not eligible (no request, grace period running,
   * or another instance already claimed it). Throws if the purge fails midway; the claim
   * goes stale after STALLED_PURGE_MS and the next run retries.
   */
  async purgeCompany(companyUuid: string): Promise<boolean> {
    const now = Date.now();
    const company = await this.prisma.company.findUnique({
      where: { id: companyUuid },
      select: { id: true, deletion_requested_at: true, deleted_at: true },
    });

    if (!company?.deletion_requested_at) return false;
    if (company.deletion_requested_at.getTime() > now - DELETION_GRACE_DAYS * DAY_MS) return false;
    if (company.deleted_at && company.deleted_at.getTime() > now - STALLED_PURGE_MS) return false;

    const claim = await this.prisma.company.updateMany({
      where: { id: companyUuid, deleted_at: company.deleted_at },
      data: { deleted_at: new Date() },
    });
    if (claim.count === 0) return false;

    this.logger.log(`Purging company ${companyUuid}`);

    await this.cleanupProviderResources(companyUuid);
    await this.purgeCalls(companyUuid);
    await this.deleteData(companyUuid);

    this.logger.log(`Company ${companyUuid} purged`);
    return true;
  }

  private async cleanupProviderResources(companyUuid: string): Promise<void> {
    const numbers = await this.prisma.phoneNumber.findMany({
      where: { company_uuid: companyUuid, status: { not: PhoneNumberStatus.RELEASED } },
      select: { id: true, number: true },
    });
    for (const n of numbers) {
      try {
        await this.voice.releasePhoneNumber(n.number);
        await this.prisma.phoneNumber.update({
          where: { id: n.id },
          data: { status: PhoneNumberStatus.RELEASED },
        });
      } catch (error) {
        this.logger.warn(`Company ${companyUuid}: could not release number ${n.number}: ${error?.message}`);
      }
    }

    const agents = await this.prisma.agent.findMany({
      where: { company_uuid: companyUuid },
      select: { id: true },
    });
    for (const agent of agents) {
      try {
        await this.voice.deleteAgent(agent.id);
      } catch (error) {
        this.logger.warn(`Company ${companyUuid}: could not delete agent ${agent.id}: ${error?.message}`);
      }
    }

    const versions = await this.prisma.knowledgeSourceVersion.findMany({
      where: { source: { company_uuid: companyUuid }, external_knowledge_base_id: { not: null } },
      select: { external_knowledge_base_id: true },
      distinct: ['external_knowledge_base_id'],
    });
    for (const v of versions) {
      try {
        await this.voice.deleteKnowledgeBase(v.external_knowledge_base_id);
      } catch (error) {
        this.logger.warn(`Company ${companyUuid}: could not delete knowledge base: ${error?.message}`);
      }
    }
  }

  /** Deletes calls in batches, with their recordings and stored provider events (which hold transcripts). */
  private async purgeCalls(companyUuid: string): Promise<void> {
    for (;;) {
      const batch = await this.prisma.call.findMany({
        where: { company_uuid: companyUuid },
        select: { id: true, external_call_id: true, recording_path: true, recording_deleted_at: true },
        orderBy: { id: 'asc' },
        take: PURGE_BATCH_SIZE,
      });
      if (batch.length === 0) return;

      const ids = batch.map((c) => c.id);
      const externalIds = batch.map((c) => c.external_call_id).filter((v): v is string => !!v);
      const recordings = batch
        .filter((c) => c.recording_path && !c.recording_deleted_at)
        .map((c) => c.recording_path);

      await this.deleteStorageFiles(recordings);
      await this.prisma.providerEvent.deleteMany({
        where: {
          OR: [
            { call_uuid: { in: ids } },
            ...(externalIds.length ? [{ external_call_id: { in: externalIds } }] : []),
          ],
        },
      });
      await this.prisma.call.deleteMany({ where: { id: { in: ids } } });
    }
  }

  private async deleteData(companyUuid: string): Promise<void> {
    const members = await this.prisma.companyMember.findMany({
      where: { company_uuid: companyUuid },
      select: { user_uuid: true, user: { select: { role: true } } },
    });
    const candidateIds = members.filter((m) => m.user.role === AuthRole.USER).map((m) => m.user_uuid);

    const stillMembers = candidateIds.length
      ? await this.prisma.companyMember.findMany({
          where: { user_uuid: { in: candidateIds }, company_uuid: { not: companyUuid } },
          select: { user_uuid: true },
        })
      : [];
    const keep = new Set(stillMembers.map((m) => m.user_uuid));
    const userIds = candidateIds.filter((id) => !keep.has(id));

    const documents = await this.prisma.document.findMany({
      where: { OR: [{ company_uuid: companyUuid }, ...(userIds.length ? [{ user_uuid: { in: userIds } }] : [])] },
      select: { path: true },
    });
    await this.deleteStorageFiles(documents.map((d) => d.path));

    await this.prisma.$transaction([
      this.prisma.document.deleteMany({
        where: { OR: [{ company_uuid: companyUuid }, ...(userIds.length ? [{ user_uuid: { in: userIds } }] : [])] },
      }),
      this.prisma.company.delete({ where: { id: companyUuid } }),
      this.prisma.user.deleteMany({ where: { id: { in: userIds } } }),
    ]);
  }

  private async deleteStorageFiles(paths: string[]): Promise<void> {
    let failed = 0;
    for (let i = 0; i < paths.length; i += STORAGE_DELETE_CONCURRENCY) {
      const chunk = paths.slice(i, i + STORAGE_DELETE_CONCURRENCY);
      const results = await Promise.allSettled(chunk.map((filename) => this.gcs.deleteImage({ filename })));
      failed += results.filter((r) => r.status === 'rejected').length;
    }
    if (failed > 0) this.logger.warn(`Could not delete ${failed}/${paths.length} stored files`);
  }
}
