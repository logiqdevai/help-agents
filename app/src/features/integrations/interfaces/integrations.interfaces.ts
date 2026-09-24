import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const IntegrationCategories = {
  CRM: "CRM",
  KNOWLEDGE: "KNOWLEDGE",
  CALENDAR: "CALENDAR",
  EMAIL: "EMAIL",
  MESSAGING: "MESSAGING",
  STORAGE: "STORAGE",
  OTHER: "OTHER",
} as const;
export type IntegrationCategory = (typeof IntegrationCategories)[keyof typeof IntegrationCategories];

export const IntegrationProviders = {
  HUBSPOT: "HUBSPOT",
  SALESFORCE: "SALESFORCE",
  PIPEDRIVE: "PIPEDRIVE",
  ZOHO: "ZOHO",
  CUSTOM_CRM: "CUSTOM_CRM",
  GENERIC_API: "GENERIC_API",
  GOOGLE_DOCS: "GOOGLE_DOCS",
  GOOGLE_DRIVE: "GOOGLE_DRIVE",
  GOOGLE_CALENDAR: "GOOGLE_CALENDAR",
  GMAIL: "GMAIL",
  NOTION: "NOTION",
  DROPBOX: "DROPBOX",
  SHAREPOINT: "SHAREPOINT",
  SLACK: "SLACK",
  OTHER: "OTHER",
} as const;
export type IntegrationProvider = (typeof IntegrationProviders)[keyof typeof IntegrationProviders];

/** Providers where the customer supplies the base URL and, for OAuth2, their own client credentials. */
export const CustomProviders: IntegrationProvider[] = [
  IntegrationProviders.CUSTOM_CRM,
  IntegrationProviders.GENERIC_API,
];

export const IntegrationStatuses = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
} as const;
export type IntegrationStatus = (typeof IntegrationStatuses)[keyof typeof IntegrationStatuses];

export const IntegrationAuthTypes = {
  API_KEY: "API_KEY",
  BEARER_TOKEN: "BEARER_TOKEN",
  BASIC: "BASIC",
  OAUTH2: "OAUTH2",
  CUSTOM_HEADERS: "CUSTOM_HEADERS",
} as const;
export type IntegrationAuthType = (typeof IntegrationAuthTypes)[keyof typeof IntegrationAuthTypes];

export const ApiKeyPlacements = {
  HEADER: "header",
  QUERY: "query",
} as const;
export type ApiKeyPlacement = (typeof ApiKeyPlacements)[keyof typeof ApiKeyPlacements];

export const MappingDirections = {
  READ: "READ",
  WRITE: "WRITE",
  BOTH: "BOTH",
} as const;
export type MappingDirection = (typeof MappingDirections)[keyof typeof MappingDirections];

export const HttpMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;
export type HttpMethod = (typeof HttpMethods)[keyof typeof HttpMethods];

/** Prefix of mapping fields that hold information collected against an agent goal item. */
export const GoalFieldPrefix = "goal.";

/** Query params the API's OAuth callback appends when it redirects the browser to the app. */
export const OAuthCallbackParams = {
  CONNECTED: "connected",
  INTEGRATION: "integration",
  ERROR: "error",
} as const;

/** A connection. Credentials are never returned — only `has_credentials` and a masked `credentials_hint`. */
export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: IntegrationProvider;
  provider_name: string;
  status: IntegrationStatus;
  base_url: string | null;
  api_docs_url: string | null;
  auth_type: IntegrationAuthType | null;
  has_credentials: boolean;
  credentials_hint: string | null;
  token_expires_at: string | null;
  config: Record<string, unknown> | null;
  last_error: string | null;
  last_verified_at: string | null;
  agent_count: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationsQuery extends PaginationQuery {
  category?: IntegrationCategory | "all";
  provider?: IntegrationProvider | "all";
  status?: IntegrationStatus | "all";
  search?: string;
}

export interface ProviderInfo {
  provider: IntegrationProvider;
  display_name: string;
  category: IntegrationCategory;
  auth_types: IntegrationAuthType[];
  oauth_available: boolean;
  requires_base_url: boolean;
  supports_crm_actions: boolean;
  coming_soon: boolean;
}

/** Write-only secrets, sent once on create / rotate. Only the fields of the chosen auth type are sent. */
export interface IntegrationCredentialsDto {
  api_key?: string;
  header_name?: string;
  query_param?: string;
  token?: string;
  username?: string;
  password?: string;
  headers?: Record<string, string>;
  client_id?: string;
  client_secret?: string;
  token_url?: string;
  scope?: string;
}

export interface CreateIntegrationDto {
  name: string;
  provider: IntegrationProvider;
  base_url?: string;
  api_docs_url?: string;
  auth_type: IntegrationAuthType;
  credentials: IntegrationCredentialsDto;
}

export interface UpdateIntegrationDto {
  name?: string;
  base_url?: string;
  /** `null` clears the link. */
  api_docs_url?: string | null;
  auth_type?: IntegrationAuthType;
  credentials?: IntegrationCredentialsDto;
  config?: GenericApiConfig;
}

export interface TestConnectionResult {
  status: IntegrationStatus;
  verified: boolean;
  error?: string;
}

export interface OAuthStartDto {
  name?: string;
  /** Reconnect this existing connection instead of creating a new one. */
  integration_uuid?: string;
}

export interface OAuthStartResult {
  authorization_url: string;
}

interface IntegrationAgentTool {
  id: string;
  key: string;
  name: string;
}

export interface IntegrationAgent {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  allowed_tools: IntegrationAgentTool[];
}

// ---------------------------------------------------------------- custom CRM endpoints

export const CrmEndpointKeys = {
  TEST: "test",
  LOOKUP: "lookup",
  UPDATE: "update",
  NOTE: "note",
  TASK: "task",
  FIELDS: "fields",
} as const;
export type CrmEndpointKey = (typeof CrmEndpointKeys)[keyof typeof CrmEndpointKeys];

/** `{placeholder}` templated HTTP call. Extra keys (result_path, id_path, …) are passed through untouched. */
export interface EndpointSpec {
  method?: HttpMethod;
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  [extra: string]: unknown;
}

export type GenericApiConfig = Partial<Record<CrmEndpointKey, EndpointSpec>>;

// ---------------------------------------------------------------- tools

interface CrmToolHttp {
  method: HttpMethod;
  path: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

export interface CrmToolInputSchema {
  type: "object";
  properties?: Record<string, { type?: string; description?: string; enum?: string[] }>;
  required?: string[];
}

export interface CrmTool {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  input_schema: CrmToolInputSchema;
  /** `platform` tools ship with the CRM provider; `custom` tools were defined on this connection. */
  scope: "platform" | "custom";
  http: CrmToolHttp | null;
  is_active: boolean;
}

export interface CrmToolsQuery {
  /** Also return custom tools that are switched off (management screens). */
  include_inactive?: boolean;
}

export interface CreateCrmToolDto {
  key: string;
  name: string;
  description?: string;
  category?: string;
  input_schema: CrmToolInputSchema;
  http: CrmToolHttp;
  is_active?: boolean;
}

export type UpdateCrmToolDto = Partial<Omit<CreateCrmToolDto, "key">>;

// ---------------------------------------------------------------- field mapping

export interface InternalField {
  key: string;
  label: string;
}

export interface InternalFieldsResponse {
  data: InternalField[];
  goal_field_prefix: string;
  note: string;
}

export interface CrmField {
  name: string;
  label: string;
  type?: string;
}

export interface FieldMapping {
  id: string;
  integration_uuid: string;
  agent_uuid: string | null;
  internal_field: string;
  external_object: string | null;
  external_field: string;
  direction: MappingDirection;
  use_for_personalization: boolean;
  transform: Record<string, unknown> | null;
}

export interface FieldMappingsResponse {
  data: FieldMapping[];
  /** Connection-level mappings an agent inherits; only present when an agent was requested. */
  inherited?: FieldMapping[];
}

export interface FieldMappingInput {
  internal_field: string;
  external_object?: string;
  external_field: string;
  direction: MappingDirection;
  use_for_personalization: boolean;
  transform?: Record<string, unknown>;
}

export interface ReplaceFieldMappingsDto {
  /** Save the mappings for this agent only; omit for connection-level mappings. */
  agent_uuid?: string;
  mappings: FieldMappingInput[];
}
