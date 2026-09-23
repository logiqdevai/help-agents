import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, Method } from 'axios';
import { assertSafeUrl } from '../../utils/url-guard.utils';

export class CrmHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'CrmHttpError';
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export interface CrmHttpRequest {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeoutMs?: number;
  /** Resolve the host and refuse internal addresses; never follow redirects. */
  guard?: boolean;
}

export interface CrmHttpResponse<T = any> {
  status: number;
  data: T;
}

@Injectable()
export class CrmHttpClient {
  private readonly logger = new Logger(CrmHttpClient.name);

  constructor(private readonly config: ConfigService) {}

  async request<T = any>(req: CrmHttpRequest): Promise<CrmHttpResponse<T>> {
    if (req.guard) {
      await assertSafeUrl(req.url, this.config.get('NODE_ENV') !== 'production');
    }

    try {
      const res = await axios.request<T>({
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: req.params,
        data: req.data,
        timeout: req.timeoutMs ?? 15000,
        maxRedirects: req.guard ? 0 : 3,
        maxContentLength: 5 * 1024 * 1024,
        validateStatus: (status) => status < 400,
      });
      return { status: res.status, data: res.data };
    } catch (error) {
      throw this.normalize(error);
    }
  }

  private normalize(error: unknown): CrmHttpError {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError<any>;
      const status = err.response?.status;
      const body = err.response?.data;
      const detail = this.extractMessage(body) ?? err.message;
      this.logger.warn(`CRM request failed (${status ?? err.code}): ${detail}`);
      return new CrmHttpError(status ? `CRM responded ${status}: ${detail}` : `CRM request failed: ${detail}`, status, body);
    }
    return new CrmHttpError(error instanceof Error ? error.message : 'CRM request failed');
  }

  private extractMessage(body: any): string | undefined {
    if (!body) return undefined;
    if (typeof body === 'string') return body.slice(0, 300);
    const candidate =
      body.message ?? body.error_description ?? body.error ?? body.errors?.[0]?.message ?? body.error?.message ?? body[0]?.message;
    if (typeof candidate === 'string') return candidate.slice(0, 300);
    try {
      return JSON.stringify(candidate ?? body).slice(0, 300);
    } catch {
      return undefined;
    }
  }
}
