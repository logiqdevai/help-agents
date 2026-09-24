import {
  IntegrationProviders,
  type IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationProviderFormOptions: { id: IntegrationProvider; label: string }[] = [
  { id: IntegrationProviders.HUBSPOT, label: "HubSpot" },
  { id: IntegrationProviders.SALESFORCE, label: "Salesforce" },
  { id: IntegrationProviders.PIPEDRIVE, label: "Pipedrive" },
  { id: IntegrationProviders.ZOHO, label: "Zoho CRM" },
  { id: IntegrationProviders.CUSTOM_CRM, label: "Custom CRM" },
  { id: IntegrationProviders.GENERIC_API, label: "Any system with an API" },
  { id: IntegrationProviders.GOOGLE_DOCS, label: "Google Docs" },
  { id: IntegrationProviders.GOOGLE_DRIVE, label: "Google Drive" },
  { id: IntegrationProviders.GOOGLE_CALENDAR, label: "Google Calendar" },
  { id: IntegrationProviders.GMAIL, label: "Gmail" },
  { id: IntegrationProviders.NOTION, label: "Notion" },
  { id: IntegrationProviders.DROPBOX, label: "Dropbox" },
  { id: IntegrationProviders.SHAREPOINT, label: "SharePoint" },
  { id: IntegrationProviders.SLACK, label: "Slack" },
  { id: IntegrationProviders.OTHER, label: "Other business apps" },
];

export function getIntegrationProviderLabel(provider: IntegrationProvider | string): string {
  return IntegrationProviderFormOptions.find((option) => option.id === provider)?.label ?? provider;
}
