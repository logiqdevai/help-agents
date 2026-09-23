import { Integration } from 'generated/prisma';
import { Method } from 'axios';
import { IntegrationCredentialsService } from '../../services/integration-credentials.service';
import { StoredCredentials } from '../../interfaces/integration.interface';
import { CrmHttpClient, CrmHttpResponse } from '../http/crm-http.client';

export interface AdapterCallOptions {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

/** Shared plumbing: authenticated JSON requests against the CRM's base URL. */
export abstract class BaseCrmAdapter {
  constructor(
    protected readonly http: CrmHttpClient,
    protected readonly credentials: IntegrationCredentialsService,
  ) {}

  protected abstract resolveBaseUrl(integration: Integration, credentials: StoredCredentials): string;

  protected guardRequests(): boolean {
    return false;
  }

  protected async call<T = any>(
    integration: Integration,
    method: Method,
    path: string,
    options: AdapterCallOptions = {},
  ): Promise<CrmHttpResponse<T>> {
    const auth = await this.credentials.buildAuth(integration);
    const base = this.resolveBaseUrl(integration, auth.credentials).replace(/\/+$/, '');

    return this.http.request<T>({
      method,
      url: `${base}${path.startsWith('/') ? path : `/${path}`}`,
      headers: { Accept: 'application/json', ...auth.headers, ...options.headers },
      params: { ...auth.query, ...options.params },
      data: options.data,
      guard: this.guardRequests(),
    });
  }
}
