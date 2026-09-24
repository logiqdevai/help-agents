import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Integration,
  IntegrationAuthType,
  IntegrationCategory,
  IntegrationProvider,
  IntegrationStatus,
  Prisma,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { CrmAdapterRegistry } from './crm/adapters/crm-adapter.registry';
import { CrmHttpError } from './crm/http/crm-http.client';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationQueryType } from './dto/integration-query.schema';
import { IntegrationAgentEntity, IntegrationEntity, ProviderInfoEntity } from './entities/integration.entity';
import { PROVIDER_CATALOGUE } from './interfaces/integration.interface';
import { OAuthTokenClient } from './oauth/oauth-token.client';
import { IntegrationCredentialsService } from './services/integration-credentials.service';
import { IntegrationStatusService } from './services/integration-status.service';
import { sanitizeConfig, validateCredentials } from './utils/integration-validation.utils';
import { assertSafeUrl } from './utils/url-guard.utils';

const GENERIC_PROVIDERS: IntegrationProvider[] = [IntegrationProvider.CUSTOM_CRM, IntegrationProvider.GENERIC_API];

export interface TestResult {
  status: IntegrationStatus;
  verified: boolean;
  error?: string;
}

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly adapters: CrmAdapterRegistry,
    private readonly oauth: OAuthTokenClient,
    private readonly credentials: IntegrationCredentialsService,
    private readonly status: IntegrationStatusService,
    private readonly activity: ActivityLogService,
  ) {}

  providers(): ProviderInfoEntity[] {
    return Object.values(PROVIDER_CATALOGUE).map((p) => {
      const oauthAvailable = !!p.oauth_env_prefix && this.oauth.isConfigured(p.provider);
      return {
        provider: p.provider,
        display_name: p.display_name,
        category: p.category,
        auth_types: p.auth_types,
        oauth_available: oauthAvailable,
        requires_base_url: p.requires_base_url,
        supports_crm_actions: p.has_crm_adapter,
        coming_soon: !p.has_crm_adapter && !oauthAvailable,
      };
    });
  }

  async findAll(companyUuid: string, query: IntegrationQueryType) {
    const where: Prisma.IntegrationWhereInput = {
      company_uuid: companyUuid,
      ...(query.category && { category: query.category }),
      ...(query.provider && { provider: query.provider }),
      ...(query.status && { status: query.status }),
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.integration.findMany({ where, orderBy: { created_at: 'desc' }, ...skipTake(query) }),
      this.prisma.integration.count({ where }),
    ]);
    const counts = await this.agentCounts(companyUuid, items.map((i) => i.id));
    return paginated(items.map((i) => this.toView(i, counts.get(i.id) ?? 0)), total, query.page, query.limit);
  }

  async findOne(companyUuid: string, id: string): Promise<IntegrationEntity> {
    const integration = await this.load(companyUuid, id);
    const counts = await this.agentCounts(companyUuid, [integration.id]);
    return this.toView(integration, counts.get(integration.id) ?? 0);
  }

  /** Agents that use this connection, with the CRM tools each one is allowed to call. */
  async agents(companyUuid: string, id: string): Promise<{ data: IntegrationAgentEntity[] }> {
    const integration = await this.load(companyUuid, id);
    const agents = await this.prisma.agent.findMany({
      where: { company_uuid: companyUuid, crm_integration_uuid: integration.id, deleted_at: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        crm_tools: { select: { crm_tool: { select: { id: true, key: true, name: true } } } },
      },
    });
    return {
      data: agents.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        allowed_tools: a.crm_tools.map((t) => t.crm_tool).sort((x, y) => x.name.localeCompare(y.name)),
      })),
    };
  }

  async create(ctx: CompanyContextData, dto: CreateIntegrationDto, ip?: string): Promise<IntegrationEntity> {
    const info = PROVIDER_CATALOGUE[dto.provider];
    if (dto.category && dto.category !== info.category) {
      throw new BadRequestException(`${info.display_name} is a ${info.category} integration`);
    }
    if (!dto.auth_type) throw new BadRequestException('auth_type is required');
    if (!info.auth_types.includes(dto.auth_type)) {
      throw new BadRequestException(`${info.display_name} does not support ${dto.auth_type} authentication`);
    }
    if (dto.auth_type === IntegrationAuthType.OAUTH2 && info.oauth_env_prefix) {
      throw new BadRequestException('Use the OAuth connect flow to connect this provider');
    }
    if (!dto.credentials) throw new BadRequestException('credentials are required');

    const allowHttp = this.allowHttp();
    const baseUrl = await this.resolveBaseUrl(info.requires_base_url, dto.base_url, allowHttp);
    const credentials = await validateCredentials(dto.auth_type, dto.credentials, allowHttp);
    const config = sanitizeConfig(dto.config, GENERIC_PROVIDERS.includes(dto.provider));

    const created = await this.prisma.integration.create({
      data: {
        company_uuid: ctx.company_uuid,
        created_by_uuid: ctx.user_uuid,
        category: info.category,
        provider: dto.provider,
        name: dto.name,
        status: IntegrationStatus.PENDING,
        base_url: baseUrl,
        api_docs_url: dto.api_docs_url ?? null,
        auth_type: dto.auth_type,
        ...this.credentials.seal(credentials),
        config: config as Prisma.InputJsonValue | undefined,
      },
    });

    const result = await this.runTest(created);
    await this.activity.logFor(ctx, 'integration.connected', 'integration', created.id, {
      provider: created.provider,
      name: created.name,
      status: result.status,
    }, ip);

    return this.findOne(ctx.company_uuid, created.id);
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdateIntegrationDto, ip?: string): Promise<IntegrationEntity> {
    const existing = await this.load(ctx.company_uuid, id);
    const info = PROVIDER_CATALOGUE[existing.provider];
    const managedOAuth = existing.auth_type === IntegrationAuthType.OAUTH2 && !!info.oauth_env_prefix;

    const data: Prisma.IntegrationUpdateInput = {};
    let needsTest = false;

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.api_docs_url !== undefined) data.api_docs_url = dto.api_docs_url;

    if (dto.base_url !== undefined) {
      if (!info.requires_base_url) throw new BadRequestException('The base URL of this provider cannot be changed');
      data.base_url = await this.resolveBaseUrl(true, dto.base_url, this.allowHttp());
      needsTest = true;
    }

    if (dto.config !== undefined) {
      data.config = sanitizeConfig(dto.config, GENERIC_PROVIDERS.includes(existing.provider)) as Prisma.InputJsonValue;
      needsTest = true;
    }

    if (dto.auth_type !== undefined || dto.credentials !== undefined) {
      if (managedOAuth) throw new BadRequestException('Reconnect this integration through the OAuth connect flow');
      const authType = dto.auth_type ?? existing.auth_type;
      if (!authType || !info.auth_types.includes(authType)) {
        throw new BadRequestException(`${info.display_name} does not support ${authType} authentication`);
      }
      if (authType === IntegrationAuthType.OAUTH2 && info.oauth_env_prefix) {
        throw new BadRequestException('Use the OAuth connect flow to connect this provider');
      }
      if (!dto.credentials) throw new BadRequestException('credentials are required when the authentication type changes');

      const credentials = await validateCredentials(authType, dto.credentials, this.allowHttp());
      Object.assign(data, this.credentials.seal(credentials), { auth_type: authType, token_expires_at: null });
      needsTest = true;
    }

    if (needsTest) data.status = IntegrationStatus.PENDING;

    const updated = await this.prisma.integration.update({ where: { id: existing.id }, data });
    if (needsTest) await this.runTest(updated);

    await this.activity.logFor(ctx, 'integration.updated', 'integration', existing.id, {
      fields: Object.keys(dto).filter((k) => k !== 'credentials'),
      credentials_rotated: dto.credentials !== undefined,
    }, ip);

    return this.findOne(ctx.company_uuid, existing.id);
  }

  async remove(ctx: CompanyContextData, id: string, ip?: string): Promise<{ deleted: true }> {
    const existing = await this.load(ctx.company_uuid, id);
    const agentCount = await this.prisma.agent.count({
      where: { crm_integration_uuid: existing.id, company_uuid: ctx.company_uuid, deleted_at: null },
    });

    await this.prisma.integration.delete({ where: { id: existing.id } });
    await this.activity.logFor(ctx, 'integration.deleted', 'integration', existing.id, {
      provider: existing.provider,
      name: existing.name,
      agents_detached: agentCount,
    }, ip);
    return { deleted: true };
  }

  async test(ctx: CompanyContextData, id: string, ip?: string): Promise<TestResult> {
    const integration = await this.load(ctx.company_uuid, id);
    const result = await this.runTest(integration);
    await this.activity.logFor(ctx, 'integration.tested', 'integration', integration.id, { status: result.status }, ip);
    return result;
  }

  /** Verifies the connection with the provider and records the outcome on the integration. */
  async runTest(integration: Integration): Promise<TestResult> {
    try {
      if (this.adapters.has(integration.provider)) {
        await this.adapters.get(integration.provider).testConnection(integration);
        await this.status.markHealthy(integration);
        return { status: IntegrationStatus.ACTIVE, verified: true };
      }

      if (integration.auth_type === IntegrationAuthType.OAUTH2) {
        await this.credentials.getCredentials(integration);
      }
      if (!integration.credentials_encrypted) throw new Error('No credentials stored');
      await this.status.markHealthy(integration);
      return { status: IntegrationStatus.ACTIVE, verified: false };
    } catch (error) {
      const message = error instanceof CrmHttpError || error instanceof Error ? error.message : 'Connection test failed';
      await this.status.markFailed(integration, message);
      return { status: IntegrationStatus.ERROR, verified: false, error: message.slice(0, 500) };
    }
  }

  toView(integration: Integration, agentCount = 0): IntegrationEntity {
    const { credentials_encrypted, ...rest } = integration;
    return {
      id: rest.id,
      name: rest.name,
      category: rest.category,
      provider: rest.provider,
      provider_name: PROVIDER_CATALOGUE[rest.provider]?.display_name ?? rest.provider,
      status: rest.status,
      base_url: rest.base_url,
      api_docs_url: rest.api_docs_url,
      auth_type: rest.auth_type,
      has_credentials: !!credentials_encrypted,
      credentials_hint: rest.credentials_hint,
      token_expires_at: rest.token_expires_at,
      config: (rest.config as Record<string, any> | null) ?? null,
      last_error: rest.last_error,
      last_verified_at: rest.last_verified_at,
      agent_count: agentCount,
      created_at: rest.created_at,
      updated_at: rest.updated_at,
    };
  }

  /** Company-scoped lookup shared by controllers. */
  async load(companyUuid: string, id: string): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({ where: { id, company_uuid: companyUuid } });
    if (!integration) throw new NotFoundException('Integration not found');
    return integration;
  }

  async loadCrm(companyUuid: string, id: string): Promise<Integration> {
    const integration = await this.load(companyUuid, id);
    if (integration.category !== IntegrationCategory.CRM) {
      throw new BadRequestException('This integration is not a CRM connection');
    }
    return integration;
  }

  private async agentCounts(companyUuid: string, integrationIds: string[]): Promise<Map<string, number>> {
    if (!integrationIds.length) return new Map();
    const rows = await this.prisma.agent.groupBy({
      by: ['crm_integration_uuid'],
      where: { company_uuid: companyUuid, crm_integration_uuid: { in: integrationIds }, deleted_at: null },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.crm_integration_uuid as string, r._count._all]));
  }

  private allowHttp(): boolean {
    return this.config.get('NODE_ENV') !== 'production';
  }

  private async resolveBaseUrl(required: boolean, baseUrl: string | undefined, allowHttp: boolean): Promise<string | null> {
    if (!required) return null;
    if (!baseUrl) throw new BadRequestException('base_url is required for this provider');
    const url = await assertSafeUrl(baseUrl, allowHttp);
    return url.toString().replace(/\/+$/, '');
  }
}
