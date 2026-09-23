import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IntegrationAuthType,
  IntegrationProvider,
  IntegrationStatus,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { AlertType, ActorType } from 'generated/prisma';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { OAuthStartDto } from '../dto/oauth-start.dto';
import { PROVIDER_CATALOGUE } from '../interfaces/integration.interface';
import { IntegrationCredentialsService } from '../services/integration-credentials.service';
import { OAuthTokenClient } from './oauth-token.client';

const STATE_PURPOSE = 'integration_oauth';

interface OAuthState {
  purpose: string;
  company_uuid: string;
  user_uuid: string;
  provider: IntegrationProvider;
  name?: string;
  integration_uuid?: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly tokens: OAuthTokenClient,
    private readonly credentials: IntegrationCredentialsService,
    private readonly activity: ActivityLogService,
    private readonly alerts: AlertsService,
  ) {}

  parseProvider(raw: string): IntegrationProvider {
    const provider = raw.toUpperCase() as IntegrationProvider;
    if (!(provider in IntegrationProvider) || !this.tokens.getConfig(provider)) {
      throw new BadRequestException('This provider does not support the OAuth connect flow');
    }
    return provider;
  }

  async start(ctx: CompanyContextData, provider: IntegrationProvider, dto: OAuthStartDto): Promise<{ authorization_url: string }> {
    const cfg = this.tokens.getConfig(provider);
    const client = this.tokens.getClientCredentials(provider);
    if (!cfg || !client) {
      throw new BadRequestException(`${PROVIDER_CATALOGUE[provider].display_name} is not configured for OAuth on this platform`);
    }

    if (dto.integration_uuid) {
      const existing = await this.prisma.integration.findFirst({
        where: { id: dto.integration_uuid, company_uuid: ctx.company_uuid, provider },
        select: { id: true },
      });
      if (!existing) throw new NotFoundException('Integration not found');
    }

    const state = await this.jwt.signAsync(
      {
        purpose: STATE_PURPOSE,
        company_uuid: ctx.company_uuid,
        user_uuid: ctx.user_uuid,
        provider,
        name: dto.name,
        integration_uuid: dto.integration_uuid,
      } satisfies OAuthState,
      { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '10m' },
    );

    const params = new URLSearchParams({
      client_id: client.id,
      redirect_uri: this.tokens.redirectUri(),
      response_type: 'code',
      state,
      ...(cfg.extra_authorize_params ?? {}),
    });
    if (cfg.scopes.length) params.set(cfg.scope_param ?? 'scope', cfg.scopes.join(cfg.scope_separator));

    return { authorization_url: `${cfg.authorize_url}?${params.toString()}` };
  }

  /** Completes the flow and returns the frontend URL to redirect the browser to. */
  async handleCallback(query: { code?: string; state?: string; error?: string }): Promise<string> {
    const target = (result: Record<string, string>) => {
      const base = (this.config.get<string>('APP_URL') ?? '').replace(/\/+$/, '');
      return `${base}/integrations?${new URLSearchParams(result).toString()}`;
    };

    let state: OAuthState;
    try {
      state = await this.jwt.verifyAsync<OAuthState>(query.state ?? '', { secret: this.config.get<string>('JWT_SECRET') });
      if (state.purpose !== STATE_PURPOSE) throw new Error('wrong purpose');
    } catch {
      return target({ error: 'invalid_state' });
    }

    if (query.error || !query.code) return target({ error: query.error === 'access_denied' ? 'access_denied' : 'authorization_failed' });

    try {
      const tokens = await this.tokens.exchangeCode(state.provider, query.code);
      const info = PROVIDER_CATALOGUE[state.provider];

      const sealed = this.credentials.seal({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        instance_url: tokens.instance_url,
        api_domain: tokens.api_domain,
      });
      const data = {
        ...sealed,
        status: IntegrationStatus.ACTIVE,
        auth_type: IntegrationAuthType.OAUTH2,
        token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        base_url: tokens.instance_url ?? tokens.api_domain ?? undefined,
        last_error: null,
        last_verified_at: new Date(),
      };

      let integrationId: string;
      if (state.integration_uuid) {
        const existing = await this.prisma.integration.findFirst({
          where: { id: state.integration_uuid, company_uuid: state.company_uuid, provider: state.provider },
          select: { id: true },
        });
        if (!existing) return target({ error: 'integration_not_found' });
        await this.prisma.integration.update({ where: { id: existing.id }, data });
        integrationId = existing.id;
      } else {
        const created = await this.prisma.integration.create({
          data: {
            ...data,
            company_uuid: state.company_uuid,
            created_by_uuid: state.user_uuid,
            category: info.category,
            provider: state.provider,
            name: state.name ?? info.display_name,
          },
        });
        integrationId = created.id;
      }

      await this.alerts.resolveFor(state.company_uuid, AlertType.INTEGRATION_FAILED, 'integration', integrationId);
      await this.activity.log({
        company_uuid: state.company_uuid,
        user_uuid: state.user_uuid,
        actor_type: ActorType.USER,
        action: 'integration.connected',
        entity_type: 'integration',
        entity_uuid: integrationId,
        metadata: { provider: state.provider, via: 'oauth' },
      });

      return target({ connected: state.provider.toLowerCase(), integration: integrationId });
    } catch (error) {
      this.logger.warn(`OAuth callback failed for ${state.provider}: ${error?.message}`);
      return target({ error: 'token_exchange_failed' });
    }
  }
}
