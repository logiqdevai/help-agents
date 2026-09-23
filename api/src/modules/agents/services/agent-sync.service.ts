import { Injectable, Logger } from '@nestjs/common';
import { AgentStatus, AlertSeverity, AlertType } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';

/** Keeps the compiled agent in the voice provider in step with our configuration. */
@Injectable()
export class AgentSyncService {
  private readonly logger = new Logger(AgentSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly voiceProvider: VoiceProviderService,
    private readonly alerts: AlertsService,
  ) {}

  /** Syncs now; raises/resolves the AI_SERVICE_UNAVAILABLE alert and returns whether it worked. */
  async syncNow(companyUuid: string, agentUuid: string): Promise<boolean> {
    try {
      await this.voiceProvider.syncAgent(agentUuid);
      await this.alerts.resolveFor(companyUuid, AlertType.AI_SERVICE_UNAVAILABLE, 'agent', agentUuid);
      return true;
    } catch (error) {
      this.logger.error(`Agent sync failed for ${agentUuid}: ${error?.message}`);
      await this.alerts.raise({
        company_uuid: companyUuid,
        type: AlertType.AI_SERVICE_UNAVAILABLE,
        severity: AlertSeverity.ERROR,
        title: 'Agent could not be updated',
        message: 'The AI service is temporarily unavailable. Your latest changes will be applied once it recovers; you can retry from the agent page.',
        entity_type: 'agent',
        entity_uuid: agentUuid,
      });
      return false;
    }
  }

  /** Fire-and-forget sync for agents that are live or were synced before. */
  scheduleIfNeeded(companyUuid: string, agentUuid: string): void {
    setImmediate(async () => {
      try {
        const agent = await this.prisma.agent.findFirst({
          where: { id: agentUuid, company_uuid: companyUuid, deleted_at: null },
          select: { status: true, provider_links: { select: { id: true }, take: 1 } },
        });
        if (!agent) return;
        if (agent.status === AgentStatus.ACTIVE || agent.provider_links.length > 0) {
          await this.syncNow(companyUuid, agentUuid);
        }
      } catch (error) {
        this.logger.error(`Scheduled agent sync failed: ${error?.message}`);
      }
    });
  }
}
