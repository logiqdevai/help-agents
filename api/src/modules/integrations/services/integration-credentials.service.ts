import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AlertType,
  Integration,
  IntegrationAuthType,
  IntegrationProvider,
  IntegrationStatus,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CryptoService } from '@/shared/utils/crypto/crypto.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { AuthContext, StoredCredentials } from '../interfaces/integration.interface';
import { NormalizedTokens, OAuthTokenClient } from '../oauth/oauth-token.client';
import { assertSafeUrl } from '../utils/url-guard.utils';
import { ConfigService } from '@nestjs/config';

const REFRESH_SKEW_MS = 60_000;

/**
 * Server-side access to decrypted integration credentials. Credentials never leave the server;
 * OAuth tokens are refreshed transparently and re-encrypted.
 */
@Injectable()
export class IntegrationCredentialsService {
  private readonly logger = new Logger(IntegrationCredentialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly oauth: OAuthTokenClient,
    private readonly alerts: AlertsService,
    private readonly config: ConfigService,
  ) {}

  /** A valid (refreshed if needed) OAuth / bearer / api-key token for the integration. Scoped by company. */
  async getAccessToken(companyUuid: string, integrationUuid: string): Promise<string> {
    const integration = await this.load(companyUuid, integrationUuid);
    const creds = await this.getCredentials(integration);

    const token =
      integration.auth_type === IntegrationAuthType.OAUTH2
        ? creds.access_token
        : integration.auth_type === IntegrationAuthType.BEARER_TOKEN
          ? creds.token
          : integration.auth_type === IntegrationAuthType.API_KEY
            ? creds.api_key
            : undefined;

    if (!token) throw new BadRequestException('This integration does not expose an access token');
    return token;
  }

  /** First ACTIVE integration of a provider for the company (e.g. GOOGLE_CALENDAR), or null. */
  async findActive(companyUuid: string, provider: IntegrationProvider): Promise<Integration | null> {
    return this.prisma.integration.findFirst({
      where: { company_uuid: companyUuid, provider, status: IntegrationStatus.ACTIVE },
      orderBy: { created_at: 'asc' },
    });
  }

  async load(companyUuid: string, integrationUuid: string): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationUuid, company_uuid: companyUuid },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    return integration;
  }

  /** Decrypts the stored credentials, refreshing an expiring OAuth access token first. */
  async getCredentials(integration: Integration): Promise<StoredCredentials> {
    if (!integration.credentials_encrypted) return {};
    const creds = this.crypto.decryptJson<StoredCredentials>(integration.credentials_encrypted);

    if (integration.auth_type !== IntegrationAuthType.OAUTH2) return creds;

    const expiring =
      integration.token_expires_at && integration.token_expires_at.getTime() - Date.now() < REFRESH_SKEW_MS;
    if (!expiring && creds.access_token) return creds;

    return this.refresh(integration, creds);
  }

  /** Headers / query parameters authenticating a request to the connected system. */
  async buildAuth(integration: Integration): Promise<AuthContext> {
    const credentials = await this.getCredentials(integration);
    const headers: Record<string, string> = {};
    const query: Record<string, string> = {};

    switch (integration.auth_type) {
      case IntegrationAuthType.OAUTH2:
        if (!credentials.access_token) throw new ServiceUnavailableException('Integration has no access token');
        headers.Authorization =
          integration.provider === IntegrationProvider.ZOHO
            ? `Zoho-oauthtoken ${credentials.access_token}`
            : `Bearer ${credentials.access_token}`;
        break;
      case IntegrationAuthType.BEARER_TOKEN:
        if (!credentials.token) throw new ServiceUnavailableException('Integration has no token');
        headers.Authorization = `Bearer ${credentials.token}`;
        break;
      case IntegrationAuthType.API_KEY: {
        if (!credentials.api_key) throw new ServiceUnavailableException('Integration has no API key');
        const queryParam =
          credentials.query_param ?? (integration.provider === IntegrationProvider.PIPEDRIVE ? 'api_token' : undefined);
        if (queryParam) query[queryParam] = credentials.api_key;
        else headers[credentials.header_name || 'X-API-Key'] = credentials.api_key;
        break;
      }
      case IntegrationAuthType.BASIC:
        headers.Authorization = `Basic ${Buffer.from(`${credentials.username ?? ''}:${credentials.password ?? ''}`).toString('base64')}`;
        break;
      case IntegrationAuthType.CUSTOM_HEADERS:
        Object.assign(headers, credentials.headers ?? {});
        break;
      default:
        throw new ServiceUnavailableException('Integration has no authentication configured');
    }

    return { headers, query, credentials };
  }

  /** Encrypts credentials and computes the masked hint stored beside them. */
  seal(credentials: StoredCredentials): { credentials_encrypted: string; credentials_hint: string | null } {
    const primary =
      credentials.api_key ??
      credentials.token ??
      credentials.access_token ??
      credentials.password ??
      credentials.client_secret ??
      (credentials.headers ? Object.values(credentials.headers)[0] : undefined);

    return {
      credentials_encrypted: this.crypto.encryptJson(credentials),
      credentials_hint: this.crypto.mask(primary),
    };
  }

  private async refresh(integration: Integration, creds: StoredCredentials): Promise<StoredCredentials> {
    try {
      let tokens: NormalizedTokens;
      const managed = this.oauth.getConfig(integration.provider);

      if (managed) {
        if (!creds.refresh_token) throw new Error('No refresh token available; reconnect the integration');
        tokens = await this.oauth.refresh(integration.provider, creds.refresh_token);
      } else {
        if (!creds.token_url || !creds.client_id || !creds.client_secret) {
          throw new Error('OAuth2 client settings are incomplete');
        }
        await assertSafeUrl(creds.token_url, this.config.get('NODE_ENV') !== 'production');
        tokens = await this.oauth.requestCustomToken(
          creds.token_url,
          creds.refresh_token
            ? { grant_type: 'refresh_token', refresh_token: creds.refresh_token }
            : { grant_type: 'client_credentials', ...(creds.scope ? { scope: creds.scope } : {}) },
          creds.client_id,
          creds.client_secret,
        );
      }

      const next: StoredCredentials = {
        ...creds,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? creds.refresh_token,
        instance_url: tokens.instance_url ?? creds.instance_url,
        api_domain: tokens.api_domain ?? creds.api_domain,
      };
      const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          ...this.seal(next),
          token_expires_at: expiresAt,
          status: IntegrationStatus.ACTIVE,
          last_error: null,
        },
      });
      integration.token_expires_at = expiresAt;
      return next;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      this.logger.warn(`Token refresh failed for integration ${integration.id}: ${message}`);
      await this.prisma.integration
        .update({
          where: { id: integration.id },
          data: { status: IntegrationStatus.ERROR, last_error: message.slice(0, 500) },
        })
        .catch(() => undefined);
      await this.alerts.raise({
        company_uuid: integration.company_uuid,
        type: AlertType.INTEGRATION_FAILED,
        title: `${integration.name} connection failed`,
        message: 'The access token could not be refreshed. Reconnect the integration.',
        entity_type: 'integration',
        entity_uuid: integration.id,
      });
      throw new ServiceUnavailableException('Integration authentication failed');
    }
  }
}
