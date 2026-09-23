import { BadRequestException } from '@nestjs/common';
import { IntegrationAuthType } from 'generated/prisma';
import { StoredCredentials } from '../interfaces/integration.interface';
import { assertSafeUrl } from './url-guard.utils';

const HEADER_NAME = /^[A-Za-z0-9-]{1,100}$/;
const QUERY_PARAM = /^[A-Za-z0-9_.-]{1,100}$/;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const RESERVED_HEADERS = ['host', 'content-length', 'transfer-encoding', 'connection'];
const GENERIC_ENDPOINTS = ['test', 'lookup', 'update', 'note', 'task', 'fields'];

const required = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`${label} is required`);
  return value;
};

/** Keeps only the fields relevant to the auth type and validates them. */
export async function validateCredentials(
  authType: IntegrationAuthType,
  input: Record<string, any>,
  allowHttp: boolean,
): Promise<StoredCredentials> {
  switch (authType) {
    case IntegrationAuthType.API_KEY: {
      const creds: StoredCredentials = { api_key: required(input.api_key, 'credentials.api_key') };
      if (input.header_name) {
        if (!HEADER_NAME.test(input.header_name)) throw new BadRequestException('credentials.header_name is invalid');
        creds.header_name = input.header_name;
      }
      if (input.query_param) {
        if (!QUERY_PARAM.test(input.query_param)) throw new BadRequestException('credentials.query_param is invalid');
        creds.query_param = input.query_param;
      }
      return creds;
    }
    case IntegrationAuthType.BEARER_TOKEN:
      return { token: required(input.token, 'credentials.token') };
    case IntegrationAuthType.BASIC:
      return {
        username: required(input.username, 'credentials.username'),
        password: required(input.password, 'credentials.password'),
      };
    case IntegrationAuthType.CUSTOM_HEADERS: {
      const headers = input.headers;
      if (!headers || typeof headers !== 'object' || Array.isArray(headers) || !Object.keys(headers).length) {
        throw new BadRequestException('credentials.headers must be a non-empty object');
      }
      for (const [name, value] of Object.entries(headers)) {
        if (!HEADER_NAME.test(name) || RESERVED_HEADERS.includes(name.toLowerCase())) {
          throw new BadRequestException(`Header name "${name}" is not allowed`);
        }
        if (typeof value !== 'string' || value.length > 2000) {
          throw new BadRequestException(`Header "${name}" must be a string of at most 2000 characters`);
        }
      }
      return { headers };
    }
    case IntegrationAuthType.OAUTH2: {
      const creds: StoredCredentials = {
        client_id: required(input.client_id, 'credentials.client_id'),
        client_secret: required(input.client_secret, 'credentials.client_secret'),
        token_url: required(input.token_url, 'credentials.token_url'),
      };
      await assertSafeUrl(creds.token_url, allowHttp);
      if (input.scope) creds.scope = String(input.scope);
      if (input.access_token) creds.access_token = String(input.access_token);
      if (input.refresh_token) creds.refresh_token = String(input.refresh_token);
      return creds;
    }
    default:
      throw new BadRequestException('Unsupported authentication type');
  }
}

function validateEndpoint(name: string, spec: any): void {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new BadRequestException(`config.${name} must be an object`);
  }
  if (typeof spec.path !== 'string' || !spec.path.startsWith('/') || spec.path.length > 500) {
    throw new BadRequestException(`config.${name}.path must start with "/"`);
  }
  if (spec.method !== undefined && !METHODS.includes(String(spec.method).toUpperCase())) {
    throw new BadRequestException(`config.${name}.method must be one of ${METHODS.join(', ')}`);
  }
}

/** Generic/custom CRMs: endpoint definitions. Known providers: only a few non-secret string settings. */
export function sanitizeConfig(config: Record<string, any> | undefined, generic: boolean): Record<string, any> | undefined {
  if (!config) return undefined;

  if (!generic) {
    const out: Record<string, string> = {};
    for (const key of ['portal_id', 'company_domain']) {
      if (config[key] != null) out[key] = String(config[key]).slice(0, 100);
    }
    return out;
  }

  for (const [key, value] of Object.entries(config)) {
    if (!GENERIC_ENDPOINTS.includes(key)) throw new BadRequestException(`Unknown config key "${key}"`);
    validateEndpoint(key, value);
  }
  return config;
}
