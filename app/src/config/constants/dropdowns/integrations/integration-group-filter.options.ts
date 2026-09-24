import {
  IntegrationProviders,
  type IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interfaces";

const IntegrationGroups = {
  CRM: "crm",
  GOOGLE: "google",
  NOTION: "notion",
  OTHER: "other",
} as const;
export type IntegrationGroup = (typeof IntegrationGroups)[keyof typeof IntegrationGroups];

export const IntegrationGroupFormOptions: { id: IntegrationGroup; label: string }[] = [
  { id: IntegrationGroups.CRM, label: "CRM" },
  { id: IntegrationGroups.GOOGLE, label: "Google" },
  { id: IntegrationGroups.NOTION, label: "Notion" },
  { id: IntegrationGroups.OTHER, label: "Other apps" },
];

export const IntegrationGroupFilterOptions: { id: IntegrationGroup | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...IntegrationGroupFormOptions,
];

const ProviderGroups: Record<IntegrationProvider, IntegrationGroup> = {
  [IntegrationProviders.HUBSPOT]: IntegrationGroups.CRM,
  [IntegrationProviders.SALESFORCE]: IntegrationGroups.CRM,
  [IntegrationProviders.PIPEDRIVE]: IntegrationGroups.CRM,
  [IntegrationProviders.ZOHO]: IntegrationGroups.CRM,
  [IntegrationProviders.CUSTOM_CRM]: IntegrationGroups.CRM,
  [IntegrationProviders.GENERIC_API]: IntegrationGroups.CRM,
  [IntegrationProviders.GOOGLE_DOCS]: IntegrationGroups.GOOGLE,
  [IntegrationProviders.GOOGLE_DRIVE]: IntegrationGroups.GOOGLE,
  [IntegrationProviders.GOOGLE_CALENDAR]: IntegrationGroups.GOOGLE,
  [IntegrationProviders.GMAIL]: IntegrationGroups.GOOGLE,
  [IntegrationProviders.NOTION]: IntegrationGroups.NOTION,
  [IntegrationProviders.DROPBOX]: IntegrationGroups.OTHER,
  [IntegrationProviders.SHAREPOINT]: IntegrationGroups.OTHER,
  [IntegrationProviders.SLACK]: IntegrationGroups.OTHER,
  [IntegrationProviders.OTHER]: IntegrationGroups.OTHER,
};

export function getIntegrationProviderGroup(provider: IntegrationProvider): IntegrationGroup {
  return ProviderGroups[provider];
}
