import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IntegrationProvider } from 'generated/prisma';
import { OAuthProviderConfig, getOAuthProviderConfig } from './oauth-providers.config';

export interface NormalizedTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  instance_url?: string;
  api_domain?: string;
}

@Injectable()
export class OAuthTokenClient {
  constructor(private readonly config: ConfigService) {}

  getConfig(provider: IntegrationProvider): OAuthProviderConfig | null {
    return getOAuthProviderConfig(provider, this.config.get<string>('ZOHO_ACCOUNTS_URL') || undefined);
  }

  getClientCredentials(provider: IntegrationProvider): { id: string; secret: string } | null {
    const cfg = this.getConfig(provider);
    if (!cfg) return null;
    const id = this.config.get<string>(`${cfg.env_prefix}_CLIENT_ID`);
    const secret = this.config.get<string>(`${cfg.env_prefix}_CLIENT_SECRET`);
    return id && secret ? { id, secret } : null;
  }

  isConfigured(provider: IntegrationProvider): boolean {
    return this.getClientCredentials(provider) !== null;
  }

  redirectUri(): string {
    const base = (this.config.get<string>('API_URL') ?? '').replace(/\/+$/, '');
    return `${base}/integrations/oauth/callback`;
  }

  exchangeCode(provider: IntegrationProvider, code: string): Promise<NormalizedTokens> {
    return this.requestTokens(provider, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri(),
    });
  }

  refresh(provider: IntegrationProvider, refreshToken: string): Promise<NormalizedTokens> {
    return this.requestTokens(provider, { grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  /** Generic OAuth2 client-credentials / refresh for customer-defined (custom CRM) token endpoints. */
  async requestCustomToken(
    tokenUrl: string,
    body: Record<string, string>,
    clientId: string,
    clientSecret: string,
  ): Promise<NormalizedTokens> {
    return this.post(tokenUrl, { ...body, client_id: clientId, client_secret: clientSecret }, undefined, 'form');
  }

  private async requestTokens(
    provider: IntegrationProvider,
    body: Record<string, string>,
  ): Promise<NormalizedTokens> {
    const cfg = this.getConfig(provider);
    const client = this.getClientCredentials(provider);
    if (!cfg || !client) {
      throw new BadRequestException('This provider is not configured for OAuth on this platform');
    }

    const format = cfg.token_body_format ?? 'form';
    if (cfg.client_auth === 'basic') {
      const basic = Buffer.from(`${client.id}:${client.secret}`).toString('base64');
      return this.post(cfg.token_url, body, { Authorization: `Basic ${basic}` }, format);
    }
    return this.post(cfg.token_url, { ...body, client_id: client.id, client_secret: client.secret }, undefined, format);
  }

  private async post(
    url: string,
    body: Record<string, string>,
    headers: Record<string, string> | undefined,
    format: 'form' | 'json',
  ): Promise<NormalizedTokens> {
    try {
      const res = await axios.post(
        url,
        format === 'json' ? body : new URLSearchParams(body).toString(),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': format === 'json' ? 'application/json' : 'application/x-www-form-urlencoded',
            ...headers,
          },
          timeout: 15000,
        },
      );
      const data = res.data ?? {};
      if (data.ok === false || data.error || !data.access_token) {
        throw new Error(data.error_description ?? data.error ?? 'Token endpoint returned no access token');
      }
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in != null ? Number(data.expires_in) : undefined,
        scope: typeof data.scope === 'string' ? data.scope : undefined,
        instance_url: data.instance_url,
        api_domain: data.api_domain,
      };
    } catch (error) {
      const detail =
        axios.isAxiosError(error)
          ? (error.response?.data?.error_description ?? error.response?.data?.error ?? error.message)
          : error instanceof Error
            ? error.message
            : 'unknown error';
      throw new ServiceUnavailableException(`OAuth token request failed: ${String(detail).slice(0, 200)}`);
    }
  }
}
