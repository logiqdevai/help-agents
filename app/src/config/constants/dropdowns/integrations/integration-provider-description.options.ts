import {
  IntegrationProviders,
  type IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interfaces";

const IntegrationProviderDescriptions: Record<IntegrationProvider, string> = {
  [IntegrationProviders.HUBSPOT]: "Contacts, deals, notes and tasks.",
  [IntegrationProviders.SALESFORCE]: "Leads, opportunities, notes and follow-up tasks.",
  [IntegrationProviders.PIPEDRIVE]: "People, deals and activities.",
  [IntegrationProviders.ZOHO]: "Contacts, leads and deals.",
  [IntegrationProviders.CUSTOM_CRM]: "Connect your own CRM with a base URL and an API key or token.",
  [IntegrationProviders.GENERIC_API]: "Anything with a REST-style API and documentation.",
  [IntegrationProviders.GOOGLE_DOCS]: "Let agents draw on documents you keep in Docs.",
  [IntegrationProviders.GOOGLE_DRIVE]: "Pull knowledge straight from shared folders.",
  [IntegrationProviders.GOOGLE_CALENDAR]: "Create calendar events when a call books an appointment.",
  [IntegrationProviders.GMAIL]: "Send confirmations and follow-ups by email.",
  [IntegrationProviders.NOTION]: "Use your Notion pages as agent knowledge.",
  [IntegrationProviders.DROPBOX]: "Connect files stored in Dropbox.",
  [IntegrationProviders.SHAREPOINT]: "Connect documents from SharePoint sites.",
  [IntegrationProviders.SLACK]: "Get notified in a channel when something needs attention.",
  [IntegrationProviders.OTHER]: "Any other business app with an API key or token.",
};

export function getIntegrationProviderDescription(provider: IntegrationProvider | string): string {
  return IntegrationProviderDescriptions[provider as IntegrationProvider] ?? "";
}
