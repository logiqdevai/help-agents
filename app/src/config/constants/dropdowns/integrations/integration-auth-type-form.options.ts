import {
  IntegrationAuthTypes,
  type IntegrationAuthType,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationAuthTypeFormOptions: { id: IntegrationAuthType; label: string }[] = [
  { id: IntegrationAuthTypes.API_KEY, label: "API key" },
  { id: IntegrationAuthTypes.BEARER_TOKEN, label: "Bearer token" },
  { id: IntegrationAuthTypes.BASIC, label: "Username / password" },
  { id: IntegrationAuthTypes.OAUTH2, label: "OAuth2" },
  { id: IntegrationAuthTypes.CUSTOM_HEADERS, label: "Custom headers" },
];

export function getIntegrationAuthTypeLabel(authType: IntegrationAuthType | string): string {
  return IntegrationAuthTypeFormOptions.find((option) => option.id === authType)?.label ?? authType;
}
