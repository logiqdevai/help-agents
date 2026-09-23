import { IntegrationAuthType, IntegrationCategory, IntegrationProvider } from 'generated/prisma';

export interface ProviderInfo {
  provider: IntegrationProvider;
  display_name: string;
  category: IntegrationCategory;
  auth_types: IntegrationAuthType[];
  /** Env prefix of `<PREFIX>_CLIENT_ID/_SECRET` when the provider supports the OAuth2 connect flow. */
  oauth_env_prefix?: string;
  /** Custom providers need a base URL supplied by the customer. */
  requires_base_url: boolean;
  /** True when the platform ships an adapter (contact lookup, updates, tools). */
  has_crm_adapter: boolean;
}

const A = IntegrationAuthType;
const C = IntegrationCategory;
const P = IntegrationProvider;

export const PROVIDER_CATALOGUE: Record<IntegrationProvider, ProviderInfo> = {
  [P.HUBSPOT]: { provider: P.HUBSPOT, display_name: 'HubSpot', category: C.CRM, auth_types: [A.OAUTH2, A.BEARER_TOKEN], oauth_env_prefix: 'HUBSPOT', requires_base_url: false, has_crm_adapter: true },
  [P.SALESFORCE]: { provider: P.SALESFORCE, display_name: 'Salesforce', category: C.CRM, auth_types: [A.OAUTH2], oauth_env_prefix: 'SALESFORCE', requires_base_url: false, has_crm_adapter: true },
  [P.PIPEDRIVE]: { provider: P.PIPEDRIVE, display_name: 'Pipedrive', category: C.CRM, auth_types: [A.OAUTH2, A.API_KEY], oauth_env_prefix: 'PIPEDRIVE', requires_base_url: false, has_crm_adapter: true },
  [P.ZOHO]: { provider: P.ZOHO, display_name: 'Zoho CRM', category: C.CRM, auth_types: [A.OAUTH2], oauth_env_prefix: 'ZOHO', requires_base_url: false, has_crm_adapter: true },
  [P.CUSTOM_CRM]: { provider: P.CUSTOM_CRM, display_name: 'Custom CRM', category: C.CRM, auth_types: [A.API_KEY, A.BEARER_TOKEN, A.BASIC, A.OAUTH2, A.CUSTOM_HEADERS], requires_base_url: true, has_crm_adapter: true },
  [P.GENERIC_API]: { provider: P.GENERIC_API, display_name: 'Generic API', category: C.CRM, auth_types: [A.API_KEY, A.BEARER_TOKEN, A.BASIC, A.OAUTH2, A.CUSTOM_HEADERS], requires_base_url: true, has_crm_adapter: true },
  [P.GOOGLE_DOCS]: { provider: P.GOOGLE_DOCS, display_name: 'Google Docs', category: C.KNOWLEDGE, auth_types: [A.OAUTH2], oauth_env_prefix: 'GOOGLE', requires_base_url: false, has_crm_adapter: false },
  [P.GOOGLE_DRIVE]: { provider: P.GOOGLE_DRIVE, display_name: 'Google Drive', category: C.STORAGE, auth_types: [A.OAUTH2], oauth_env_prefix: 'GOOGLE', requires_base_url: false, has_crm_adapter: false },
  [P.GOOGLE_CALENDAR]: { provider: P.GOOGLE_CALENDAR, display_name: 'Google Calendar', category: C.CALENDAR, auth_types: [A.OAUTH2], oauth_env_prefix: 'GOOGLE', requires_base_url: false, has_crm_adapter: false },
  [P.GMAIL]: { provider: P.GMAIL, display_name: 'Gmail', category: C.EMAIL, auth_types: [A.OAUTH2], oauth_env_prefix: 'GOOGLE', requires_base_url: false, has_crm_adapter: false },
  [P.NOTION]: { provider: P.NOTION, display_name: 'Notion', category: C.KNOWLEDGE, auth_types: [A.OAUTH2, A.BEARER_TOKEN], oauth_env_prefix: 'NOTION', requires_base_url: false, has_crm_adapter: false },
  [P.DROPBOX]: { provider: P.DROPBOX, display_name: 'Dropbox', category: C.STORAGE, auth_types: [A.BEARER_TOKEN], requires_base_url: false, has_crm_adapter: false },
  [P.SHAREPOINT]: { provider: P.SHAREPOINT, display_name: 'SharePoint', category: C.STORAGE, auth_types: [A.BEARER_TOKEN], requires_base_url: false, has_crm_adapter: false },
  [P.SLACK]: { provider: P.SLACK, display_name: 'Slack', category: C.MESSAGING, auth_types: [A.OAUTH2, A.BEARER_TOKEN], oauth_env_prefix: 'SLACK', requires_base_url: false, has_crm_adapter: false },
  [P.OTHER]: { provider: P.OTHER, display_name: 'Other app', category: C.OTHER, auth_types: [A.API_KEY, A.BEARER_TOKEN, A.BASIC, A.CUSTOM_HEADERS], requires_base_url: true, has_crm_adapter: false },
};

/** Decrypted content of `Integration.credentials_encrypted`. Never leaves the server. */
export interface StoredCredentials {
  // API_KEY
  api_key?: string;
  header_name?: string;
  query_param?: string;
  // BEARER_TOKEN
  token?: string;
  // BASIC
  username?: string;
  password?: string;
  // CUSTOM_HEADERS
  headers?: Record<string, string>;
  // OAUTH2 (managed flow and custom client-credentials)
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  instance_url?: string;
  api_domain?: string;
  client_id?: string;
  client_secret?: string;
  token_url?: string;
}

export interface AuthContext {
  headers: Record<string, string>;
  query: Record<string, string>;
  credentials: StoredCredentials;
}
