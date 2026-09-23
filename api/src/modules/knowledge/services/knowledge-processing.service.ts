import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertSeverity, AlertType, KnowledgeStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { VoiceProviderService } from '../../voice-provider/voice-provider.service';

const STUCK_AFTER_MS = 10 * 60 * 1000;
const PROCESSING_ERROR = 'The content could not be processed. Please refresh to try again.';

/** Turns knowledge versions into something agents can search live, and keeps agents in sync. */
@Injectable()
export class KnowledgeProcessingService {
  private readonly logger = new Logger(KnowledgeProcessingService.name);
  private readonly active = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: VoiceProviderService,
    private readonly alerts: AlertsService,
  ) {}

  enqueue(versionId: string): void {
    setImmediate(() => {
      this.process(versionId).catch((error) =>
        this.logger.error(`Processing version ${versionId} crashed: ${error?.message}`),
      );
    });
  }

  async process(versionId: string): Promise<void> {
    if (this.active.has(versionId)) return;
    this.active.add(versionId);

    try {
      const version = await this.prisma.knowledgeSourceVersion.findUnique({
        where: { id: versionId },
        include: { source: true },
      });
      if (!version || version.status !== KnowledgeStatus.PROCESSING) return;

      const source = version.source;
      if (source.deleted_at) return;

      if (version.version !== source.current_version) {
        await this.prisma.knowledgeSourceVersion.update({
          where: { id: version.id },
          data: { status: KnowledgeStatus.FAILED, error: 'Replaced by a newer version before processing' },
        });
        return;
      }

      try {
        const result = await this.voice.syncKnowledgeVersion({ source_uuid: source.id, version: version.version });
        const now = new Date();

        await this.prisma.knowledgeSourceVersion.update({
          where: { id: version.id },
          data: {
            status: KnowledgeStatus.READY,
            error: null,
            external_knowledge_base_id: result.external_knowledge_base_id,
            external_source_id: result.external_source_id ?? null,
            indexed_at: now,
          },
        });
        await this.prisma.knowledgeSource.updateMany({
          where: { id: source.id, current_version: version.version },
          data: { status: KnowledgeStatus.READY, last_error: null, last_refreshed_at: now },
        });
        await this.alerts.resolveFor(source.company_uuid, AlertType.KNOWLEDGE_PROCESSING_FAILED, 'knowledge_source', source.id);
      } catch (error) {
        this.logger.error(`Knowledge version ${version.id} failed: ${error?.message}`);
        await this.prisma.knowledgeSourceVersion.update({
          where: { id: version.id },
          data: { status: KnowledgeStatus.FAILED, error: PROCESSING_ERROR },
        });
        await this.prisma.knowledgeSource.updateMany({
          where: { id: source.id, current_version: version.version },
          data: { status: KnowledgeStatus.FAILED, last_error: PROCESSING_ERROR },
        });
        await this.alerts.raise({
          company_uuid: source.company_uuid,
          type: AlertType.KNOWLEDGE_PROCESSING_FAILED,
          severity: AlertSeverity.ERROR,
          title: `Knowledge upload failed to process: ${source.name}`,
          message: PROCESSING_ERROR,
          entity_type: 'knowledge_source',
          entity_uuid: source.id,
        });
        return;
      }

      const agentIds = await this.attachedAgentIds(source.id);
      const synced = await this.resyncAgents(agentIds);
      if (synced) await this.deleteSupersededKnowledgeBases(source.id, version.id);
    } finally {
      this.active.delete(versionId);
    }
  }

  async attachedAgentIds(sourceUuid: string): Promise<string[]> {
    const links = await this.prisma.agentKnowledgeSource.findMany({
      where: { source_uuid: sourceUuid, agent: { deleted_at: null } },
      select: { agent_uuid: true },
    });
    return links.map((l) => l.agent_uuid);
  }

  /** Re-syncs each agent; returns false if any failed (they can be retried by saving/refreshing). */
  async resyncAgents(agentIds: string[]): Promise<boolean> {
    let ok = true;
    for (const agentId of agentIds) {
      try {
        await this.voice.syncAgent(agentId);
      } catch (error) {
        ok = false;
        this.logger.error(`Could not re-sync agent ${agentId} after a knowledge change: ${error?.message}`);
      }
    }
    return ok;
  }

  /** Removes provider knowledge bases of every version except `keepVersionId` (all when omitted). */
  async deleteSupersededKnowledgeBases(sourceUuid: string, keepVersionId?: string): Promise<void> {
    const versions = await this.prisma.knowledgeSourceVersion.findMany({
      where: {
        source_uuid: sourceUuid,
        external_knowledge_base_id: { not: null },
        ...(keepVersionId && { id: { not: keepVersionId } }),
      },
      select: { id: true, external_knowledge_base_id: true },
    });

    for (const v of versions) {
      try {
        await this.voice.deleteKnowledgeBase(v.external_knowledge_base_id);
        await this.prisma.knowledgeSourceVersion.update({
          where: { id: v.id },
          data: { external_knowledge_base_id: null, external_source_id: null },
        });
      } catch (error) {
        this.logger.warn(`Could not delete knowledge base of version ${v.id}: ${error?.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryStuck(): Promise<void> {
    try {
      const stuck = await this.prisma.knowledgeSourceVersion.findMany({
        where: {
          status: KnowledgeStatus.PROCESSING,
          created_at: { lt: new Date(Date.now() - STUCK_AFTER_MS) },
          source: { deleted_at: null },
        },
        orderBy: { created_at: 'asc' },
        take: 20,
        select: { id: true },
      });
      for (const v of stuck) await this.process(v.id);
    } catch (error) {
      this.logger.error(`Retrying stuck knowledge versions failed: ${error?.message}`);
    }
  }
}
