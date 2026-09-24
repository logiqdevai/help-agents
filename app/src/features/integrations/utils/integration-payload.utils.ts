import {
  ApiKeyPlacements,
  CustomProviders,
  IntegrationAuthTypes,
  type CreateIntegrationDto,
  type IntegrationAuthType,
  type IntegrationCredentialsDto,
  type ProviderInfo,
} from "@/features/integrations/interfaces/integrations.interfaces";
import type {
  ConnectionFormData,
  CredentialsFormData,
} from "@/features/integrations/validation-schemas/integrations.schema";

/** Auth types that can be entered by hand: managed sign-in providers use their own OAuth flow instead of OAuth2 fields. */
export const getManualAuthTypes = (provider: ProviderInfo): IntegrationAuthType[] =>
  provider.auth_types.filter(
    (authType) => authType !== IntegrationAuthTypes.OAUTH2 || CustomProviders.includes(provider.provider),
  );

export const DefaultApiKeyHeader = "X-API-Key";
export const DefaultApiKeyQueryParam = "api_key";

/** Empty values for the credential fields of one auth type (used to reset the form when the type changes). */
export const CredentialFormDefaults: Record<IntegrationAuthType, CredentialsFormData> = {
  [IntegrationAuthTypes.API_KEY]: {
    auth_type: IntegrationAuthTypes.API_KEY,
    api_key: "",
    placement: ApiKeyPlacements.HEADER,
    key_name: DefaultApiKeyHeader,
  },
  [IntegrationAuthTypes.BEARER_TOKEN]: { auth_type: IntegrationAuthTypes.BEARER_TOKEN, token: "" },
  [IntegrationAuthTypes.BASIC]: { auth_type: IntegrationAuthTypes.BASIC, username: "", password: "" },
  [IntegrationAuthTypes.OAUTH2]: {
    auth_type: IntegrationAuthTypes.OAUTH2,
    client_id: "",
    client_secret: "",
    token_url: "",
    scope: "",
  },
  [IntegrationAuthTypes.CUSTOM_HEADERS]: {
    auth_type: IntegrationAuthTypes.CUSTOM_HEADERS,
    headers: [{ name: "", value: "" }],
  },
};

/** Maps validated credential fields to the API shape; only the fields of the chosen auth type are sent. */
export function toCredentialsDto(values: CredentialsFormData): {
  auth_type: IntegrationAuthType;
  credentials: IntegrationCredentialsDto;
} {
  switch (values.auth_type) {
    case IntegrationAuthTypes.API_KEY:
      return {
        auth_type: values.auth_type,
        credentials: {
          api_key: values.api_key,
          ...(values.placement === ApiKeyPlacements.QUERY
            ? { query_param: values.key_name }
            : { header_name: values.key_name }),
        },
      };
    case IntegrationAuthTypes.BEARER_TOKEN:
      return { auth_type: values.auth_type, credentials: { token: values.token } };
    case IntegrationAuthTypes.BASIC:
      return {
        auth_type: values.auth_type,
        credentials: { username: values.username, password: values.password },
      };
    case IntegrationAuthTypes.OAUTH2:
      return {
        auth_type: values.auth_type,
        credentials: {
          client_id: values.client_id,
          client_secret: values.client_secret,
          token_url: values.token_url,
          ...(values.scope ? { scope: values.scope } : {}),
        },
      };
    case IntegrationAuthTypes.CUSTOM_HEADERS:
      return {
        auth_type: values.auth_type,
        credentials: { headers: Object.fromEntries(values.headers.map((h) => [h.name, h.value])) },
      };
  }
}

export function toCreateIntegrationDto(values: ConnectionFormData): CreateIntegrationDto {
  return {
    name: values.name,
    provider: values.provider,
    ...(values.base_url ? { base_url: values.base_url } : {}),
    ...(values.api_docs_url ? { api_docs_url: values.api_docs_url } : {}),
    ...toCredentialsDto(values),
  };
}
