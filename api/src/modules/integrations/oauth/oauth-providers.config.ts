import { IntegrationProvider } from 'generated/prisma';

export interface OAuthProviderConfig {
  authorize_url: string;
  token_url: string;
  scopes: string[];
  scope_separator: string;
  scope_param?: string;
  extra_authorize_params?: Record<string, string>;
  /** How client credentials reach the token endpoint. */
  client_auth: 'body' | 'basic';
  token_body_format?: 'form' | 'json';
  /** Env prefix for `<PREFIX>_CLIENT_ID` / `<PREFIX>_CLIENT_SECRET`. */
  env_prefix: string;
}

const GOOGLE = {
  authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_url: 'https://oauth2.googleapis.com/token',
  scope_separator: ' ',
  extra_authorize_params: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
  client_auth: 'body' as const,
  env_prefix: 'GOOGLE',
};

export function getOAuthProviderConfig(
  provider: IntegrationProvider,
  zohoAccountsUrl = 'https://accounts.zoho.com',
): OAuthProviderConfig | null {
  const zoho = zohoAccountsUrl.replace(/\/+$/, '');

  switch (provider) {
    case IntegrationProvider.HUBSPOT:
      return {
        authorize_url: 'https://app.hubspot.com/oauth/authorize',
        token_url: 'https://api.hubapi.com/oauth/v1/token',
        scopes: [
          'crm.objects.contacts.read',
          'crm.objects.contacts.write',
          'crm.objects.companies.read',
          'crm.objects.deals.read',
          'crm.objects.deals.write',
          'crm.schemas.contacts.read',
          'crm.schemas.deals.read',
        ],
        scope_separator: ' ',
        client_auth: 'body',
        env_prefix: 'HUBSPOT',
      };
    case IntegrationProvider.SALESFORCE:
      return {
        authorize_url: 'https://login.salesforce.com/services/oauth2/authorize',
        token_url: 'https://login.salesforce.com/services/oauth2/token',
        scopes: ['api', 'refresh_token', 'offline_access'],
        scope_separator: ' ',
        client_auth: 'body',
        env_prefix: 'SALESFORCE',
      };
    case IntegrationProvider.PIPEDRIVE:
      return {
        authorize_url: 'https://oauth.pipedrive.com/oauth/authorize',
        token_url: 'https://oauth.pipedrive.com/oauth/token',
        scopes: [],
        scope_separator: ' ',
        client_auth: 'basic',
        env_prefix: 'PIPEDRIVE',
      };
    case IntegrationProvider.ZOHO:
      return {
        authorize_url: `${zoho}/oauth/v2/auth`,
        token_url: `${zoho}/oauth/v2/token`,
        scopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.fields.READ', 'ZohoCRM.users.READ'],
        scope_separator: ',',
        extra_authorize_params: { access_type: 'offline', prompt: 'consent' },
        client_auth: 'body',
        env_prefix: 'ZOHO',
      };
    case IntegrationProvider.GOOGLE_DOCS:
      return { ...GOOGLE, scopes: ['https://www.googleapis.com/auth/documents.readonly'] };
    case IntegrationProvider.GOOGLE_DRIVE:
      return { ...GOOGLE, scopes: ['https://www.googleapis.com/auth/drive.readonly'] };
    case IntegrationProvider.GOOGLE_CALENDAR:
      return { ...GOOGLE, scopes: ['https://www.googleapis.com/auth/calendar.events'] };
    case IntegrationProvider.GMAIL:
      return { ...GOOGLE, scopes: ['https://www.googleapis.com/auth/gmail.send'] };
    case IntegrationProvider.NOTION:
      return {
        authorize_url: 'https://api.notion.com/v1/oauth/authorize',
        token_url: 'https://api.notion.com/v1/oauth/token',
        scopes: [],
        scope_separator: ' ',
        extra_authorize_params: { owner: 'user' },
        client_auth: 'basic',
        token_body_format: 'json',
        env_prefix: 'NOTION',
      };
    case IntegrationProvider.SLACK:
      return {
        authorize_url: 'https://slack.com/oauth/v2/authorize',
        token_url: 'https://slack.com/api/oauth.v2.access',
        scopes: ['chat:write', 'channels:read'],
        scope_separator: ',',
        client_auth: 'body',
        env_prefix: 'SLACK',
      };
    default:
      return null;
  }
}
