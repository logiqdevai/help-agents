import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentProviderLink, SyncStatus, VoiceProvider } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { RetellAgentsService } from '@/integrations/retell/services/retell-agents.service';
import { RetellCallsService } from '@/integrations/retell/services/retell-calls.service';
import { RetellKnowledgeBasesService } from '@/integrations/retell/services/retell-knowledge-bases.service';
import { RetellLlmsService } from '@/integrations/retell/services/retell-llms.service';
import { RetellPhoneNumbersService } from '@/integrations/retell/services/retell-phone-numbers.service';
import { RetellVoicesService } from '@/integrations/retell/services/retell-voices.service';
import { RetellWebhooksService } from '@/integrations/retell/services/retell-webhooks.service';
import {
  CreateOutboundCallInput,
  CreateOutboundCallResult,
  ImportPhoneNumberInput,
  ProviderCallPayload,
  ProviderPhoneNumber,
  ProvisionPhoneNumberInput,
  SyncKnowledgeVersionResult,
  VoiceOption,
} from './interfaces/voice-provider.interface';
import {
  GENERIC_SYNC_ERROR,
  INBOUND_SIP_ADDRESS,
  PROVISIONING_COUNTRIES,
  WEBHOOK_PATHS,
} from './voice-provider.constants';
import {
  AGENT_SYNC_INCLUDE,
  compileAgentConfig,
  hashConfig,
  toPersonalizationVariables,
} from './utils/agent-config.compiler';

const VOICES_CACHE_MS = 10 * 60 * 1000;
const KB_POLL_INTERVAL_MS = 2000;
const KB_POLL_MAX_ATTEMPTS = 45;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isNotFound(error: unknown): boolean {
  return error instanceof HttpException && error.getStatus() === 404;
}

/**
 * Facade over the underlying voice provider (currently Retell); the rest of the platform only
 * sees the provider-neutral shapes in `interfaces/voice-provider.interface.ts`.
 */
@Injectable()
export class VoiceProviderService {
  private readonly logger = new Logger(VoiceProviderService.name);
  private voicesCache: { at: number; voices: VoiceOption[] } | null = null;
  private readonly syncLocks = new Map<string, Promise<unknown>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly agents: RetellAgentsService,
    private readonly llms: RetellLlmsService,
    private readonly calls: RetellCallsService,
    private readonly knowledgeBases: RetellKnowledgeBasesService,
    private readonly phoneNumbers: RetellPhoneNumbersService,
    private readonly voices: RetellVoicesService,
    private readonly webhooks: RetellWebhooksService,
  ) {}

  private webhookUrl(path: string): string {
    const base = (this.config.get<string>('API_URL') ?? '').replace(/\/+$/, '');
    return `${base}${path}`;
  }

  // ---------------------------------------------------------------- agents

  /**
   * Compiles the agent into provider config, creates or updates the provider LLM + agent,
   * publishes it and upserts the AgentProviderLink. Rethrows a generic error on failure.
   */
  async syncAgent(agentUuid: string): Promise<AgentProviderLink> {
    const previous = this.syncLocks.get(agentUuid) ?? Promise.resolve();
    const run = previous.catch(() => undefined).then(() => this.doSyncAgent(agentUuid));
    this.syncLocks.set(agentUuid, run);
    try {
      return await run;
    } finally {
      if (this.syncLocks.get(agentUuid) === run) this.syncLocks.delete(agentUuid);
    }
  }

  private async doSyncAgent(agentUuid: string): Promise<AgentProviderLink> {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentUuid, deleted_at: null },
      include: AGENT_SYNC_INCLUDE,
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const mappings = agent.crm_integration_uuid
      ? await this.prisma.crmFieldMapping.findMany({
          where: {
            company_uuid: agent.company_uuid,
            integration_uuid: agent.crm_integration_uuid,
            use_for_personalization: true,
            OR: [{ agent_uuid: agent.id }, { agent_uuid: null }],
          },
          select: { internal_field: true, agent_uuid: true },
        })
      : [];

    const existing = await this.prisma.agentProviderLink.findUnique({
      where: { agent_uuid_provider: { agent_uuid: agent.id, provider: VoiceProvider.RETELL } },
    });

    let llmId = existing?.external_llm_id ?? null;
    let agentId = existing?.external_agent_id ?? null;

    try {
      const compiled = compileAgentConfig({
        agent,
        personalization: toPersonalizationVariables(mappings, agent.id),
        webhookUrls: {
          events: this.webhookUrl(WEBHOOK_PATHS.events),
          tools: this.webhookUrl(WEBHOOK_PATHS.tools),
        },
      });
      const voiceId = agent.voice || (await this.defaultVoiceId());
      const configHash = hashConfig({ ...compiled, voice_id: voiceId });

      if (
        existing &&
        existing.config_hash === configHash &&
        existing.sync_status === SyncStatus.SYNCED &&
        existing.is_published
      ) {
        return existing;
      }

      let agentVersion: number;
      let llmVersion: number;

      if (!existing) {
        const llm = await this.llms.createLlm(compiled.llm);
        llmId = llm.llm_id;
        const created = await this.agents.createAgent({
          ...compiled.agent,
          voice_id: voiceId,
          response_engine: { type: 'retell-llm', llm_id: llm.llm_id, version: llm.version },
        });
        agentId = created.agent_id;
        llmVersion = llm.version ?? 0;
        agentVersion = created.version;
      } else {
        const current = await this.agents.getAgent(agentId);
        if (current.is_published) {
          await this.agents.createAgentVersion(agentId, { base_version: current.version });
        }
        const llm = await this.llms.updateLlm(llmId, compiled.llm);
        const updated = await this.agents.updateAgent(agentId, {
          ...compiled.agent,
          voice_id: voiceId,
          response_engine: { type: 'retell-llm', llm_id: llmId, version: llm.version },
        });
        llmVersion = llm.version ?? 0;
        agentVersion = updated.version;
      }

      await this.agents.publishAgent(agentId, { version: agentVersion });

      const data = {
        external_agent_id: agentId,
        external_llm_id: llmId,
        agent_version: agentVersion,
        llm_version: llmVersion,
        is_published: true,
        config_hash: configHash,
        sync_status: SyncStatus.SYNCED,
        synced_at: new Date(),
        last_error: null,
      };

      return await this.prisma.agentProviderLink.upsert({
        where: { agent_uuid_provider: { agent_uuid: agent.id, provider: VoiceProvider.RETELL } },
        create: { agent_uuid: agent.id, provider: VoiceProvider.RETELL, ...data },
        update: data,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to sync agent ${agentUuid}: ${message}`);

      if (existing) {
        await this.prisma.agentProviderLink
          .update({
            where: { id: existing.id },
            data: { sync_status: SyncStatus.FAILED, last_error: message.slice(0, 1000) },
          })
          .catch(() => undefined);
      } else if (agentId || llmId) {
        await this.cleanupOrphans(agentId, llmId);
      }

      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(GENERIC_SYNC_ERROR);
    }
  }

  private async cleanupOrphans(agentId: string | null, llmId: string | null) {
    if (agentId) await this.agents.deleteAgent(agentId).catch(() => undefined);
    if (llmId) await this.llms.deleteLlm(llmId).catch(() => undefined);
  }

  private async defaultVoiceId(): Promise<string> {
    const voices = await this.listVoices();
    if (!voices.length) throw new ServiceUnavailableException('No voices are available');
    return voices[0].voice_id;
  }

  async deleteAgent(agentUuid: string): Promise<void> {
    const links = await this.prisma.agentProviderLink.findMany({ where: { agent_uuid: agentUuid } });

    for (const link of links) {
      try {
        await this.agents.deleteAgent(link.external_agent_id).catch((e) => {
          if (!isNotFound(e)) throw e;
        });
        if (link.external_llm_id) {
          await this.llms.deleteLlm(link.external_llm_id).catch((e) => {
            if (!isNotFound(e)) throw e;
          });
        }
        await this.prisma.agentProviderLink.deleteMany({ where: { id: link.id } });
      } catch (error) {
        this.logger.error(`Failed to delete provider agent for ${agentUuid}: ${error?.message}`);
        throw new ServiceUnavailableException('The agent could not be removed right now. Please try again shortly.');
      }
    }
  }

  // ----------------------------------------------------------------- calls

  async createOutboundCall(input: CreateOutboundCallInput): Promise<CreateOutboundCallResult> {
    let link = await this.prisma.agentProviderLink.findUnique({
      where: { agent_uuid_provider: { agent_uuid: input.agent_uuid, provider: VoiceProvider.RETELL } },
    });
    if (!link || link.sync_status !== SyncStatus.SYNCED || !link.is_published) {
      link = await this.syncAgent(input.agent_uuid);
    }

    const call = await this.calls.createPhoneCall({
      from_number: input.from_number,
      to_number: input.to_number,
      override_agent_id: link.external_agent_id,
      ...(link.agent_version != null ? { override_agent_version: link.agent_version } : {}),
      retell_llm_dynamic_variables: input.dynamic_variables,
      metadata: { ...(input.metadata ?? {}), call_uuid: input.call_uuid, agent_uuid: input.agent_uuid },
    });

    return { external_call_id: call.call_id, agent_version: link.agent_version };
  }

  async stopCall(externalCallId: string): Promise<void> {
    await this.calls.stopCall(externalCallId);
  }

  async getCall(externalCallId: string): Promise<ProviderCallPayload> {
    return (await this.calls.getCall(externalCallId)) as unknown as ProviderCallPayload;
  }

  // ---------------------------------------------------------------- voices

  async listVoices(): Promise<VoiceOption[]> {
    if (this.voicesCache && Date.now() - this.voicesCache.at < VOICES_CACHE_MS) {
      return this.voicesCache.voices;
    }
    const raw = await this.voices.listVoices();
    const voices: VoiceOption[] = raw.map((v) => ({
      voice_id: v.voice_id,
      name: v.voice_name,
      gender: v.gender ?? null,
      accent: v.accent ?? null,
      language: null,
      preview_audio_url: v.preview_audio_url ?? null,
    }));
    this.voicesCache = { at: Date.now(), voices };
    return voices;
  }

  // --------------------------------------------------------- phone numbers

  async provisionPhoneNumber(input: ProvisionPhoneNumberInput): Promise<ProviderPhoneNumber> {
    const country = (input.country_code ?? 'US').toUpperCase();
    if (!(PROVISIONING_COUNTRIES as readonly string[]).includes(country)) {
      throw new BadRequestException(
        `Numbers can currently be provisioned in: ${PROVISIONING_COUNTRIES.join(', ')}. Bring your own number for other countries.`,
      );
    }
    let areaCode: number | undefined;
    if (input.area_code) {
      areaCode = parseInt(input.area_code, 10);
      if (!Number.isInteger(areaCode)) throw new BadRequestException('Invalid area code');
    }

    const created = await this.phoneNumbers.createPhoneNumber({
      country_code: country as 'US' | 'CA',
      ...(areaCode ? { area_code: areaCode } : {}),
      ...(input.label ? { nickname: input.label } : {}),
      inbound_webhook_url: this.webhookUrl(WEBHOOK_PATHS.inbound),
    });

    return {
      number: created.phone_number,
      external_id: created.phone_number,
      provider_number_type: created.phone_number_type,
      byo_config: null,
    };
  }

  async importPhoneNumber(input: ImportPhoneNumberInput): Promise<ProviderPhoneNumber> {
    const imported = await this.phoneNumbers.importPhoneNumber({
      phone_number: input.number,
      termination_uri: input.termination_uri,
      ...(input.sip_username ? { sip_trunk_auth_username: input.sip_username } : {}),
      ...(input.sip_password ? { sip_trunk_auth_password: input.sip_password } : {}),
      ...(input.label ? { nickname: input.label } : {}),
      inbound_webhook_url: this.webhookUrl(WEBHOOK_PATHS.inbound),
    });

    return {
      number: imported.phone_number,
      external_id: imported.phone_number,
      provider_number_type: imported.phone_number_type,
      byo_config: { termination_uri: input.termination_uri, inbound_sip_address: INBOUND_SIP_ADDRESS },
    };
  }

  async bindPhoneNumber(number: string, agentUuid: string | null): Promise<void> {
    if (!agentUuid) {
      await this.phoneNumbers.updatePhoneNumber(number, {
        inbound_agents: null,
        outbound_agents: null,
        inbound_webhook_url: null,
      });
      return;
    }

    let link = await this.prisma.agentProviderLink.findUnique({
      where: { agent_uuid_provider: { agent_uuid: agentUuid, provider: VoiceProvider.RETELL } },
    });
    if (!link || !link.is_published) link = await this.syncAgent(agentUuid);

    const binding = [{ agent_id: link.external_agent_id, weight: 1 }];
    await this.phoneNumbers.updatePhoneNumber(number, {
      inbound_agents: binding,
      outbound_agents: binding,
      inbound_webhook_url: this.webhookUrl(WEBHOOK_PATHS.inbound),
    });
  }

  async releasePhoneNumber(number: string): Promise<void> {
    try {
      await this.phoneNumbers.deletePhoneNumber(number);
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  // ------------------------------------------------------------- knowledge

  async syncKnowledgeVersion(input: {
    source_uuid: string;
    version: number;
  }): Promise<SyncKnowledgeVersionResult> {
    const version = await this.prisma.knowledgeSourceVersion.findUnique({
      where: { source_uuid_version: { source_uuid: input.source_uuid, version: input.version } },
      include: { source: { select: { name: true } } },
    });
    if (!version) throw new NotFoundException('Knowledge version not found');

    const kb = await this.knowledgeBases.createKnowledgeBase({
      knowledge_base_name: `${version.source.name} v${version.version} ${input.source_uuid.slice(0, 8)}`.slice(0, 39),
      knowledge_base_texts: [{ title: version.source.name.slice(0, 200), text: version.content }],
    });

    let current = kb;
    for (let i = 0; i < KB_POLL_MAX_ATTEMPTS && current.status !== 'complete'; i++) {
      if (current.status === 'error') break;
      await sleep(KB_POLL_INTERVAL_MS);
      current = await this.knowledgeBases.getKnowledgeBase(kb.knowledge_base_id);
    }

    if (current.status !== 'complete') {
      await this.knowledgeBases.deleteKnowledgeBase(kb.knowledge_base_id).catch(() => undefined);
      throw new ServiceUnavailableException('Knowledge processing did not complete');
    }

    const source = current.knowledge_base_sources?.[0];
    return {
      external_knowledge_base_id: kb.knowledge_base_id,
      external_source_id: source && 'source_id' in source ? source.source_id : null,
    };
  }

  async deleteKnowledgeBase(externalKnowledgeBaseId: string): Promise<void> {
    try {
      await this.knowledgeBases.deleteKnowledgeBase(externalKnowledgeBaseId);
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  // -------------------------------------------------------------- webhooks

  async verifyWebhook(rawBody: string, signature: string | undefined): Promise<boolean> {
    if (!signature || !rawBody) return false;
    return this.webhooks.verifySignature(rawBody, signature);
  }
}
