import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CrmService } from './crm/crm.service';
import { CrmHttpClient } from './crm/http/crm-http.client';
import { CrmAdapterRegistry } from './crm/adapters/crm-adapter.registry';
import { HubspotAdapter } from './crm/adapters/hubspot.adapter';
import { SalesforceAdapter } from './crm/adapters/salesforce.adapter';
import { PipedriveAdapter } from './crm/adapters/pipedrive.adapter';
import { ZohoAdapter } from './crm/adapters/zoho.adapter';
import { GenericApiAdapter } from './crm/adapters/generic-api.adapter';
import { CrmToolSeederService } from './crm/catalogue/crm-tool-seeder.service';
import { IntegrationCredentialsService } from './services/integration-credentials.service';
import { IntegrationStatusService } from './services/integration-status.service';
import { CrmToolsService } from './services/crm-tools.service';
import { FieldMappingsService } from './services/field-mappings.service';
import { OAuthTokenClient } from './oauth/oauth-token.client';
import { OAuthService } from './oauth/oauth.service';
import { OAuthController } from './oauth/oauth.controller';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { CrmToolsController } from './crm-tools.controller';
import { FieldMappingsController } from './field-mappings.controller';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  // Controllers with literal paths (oauth/*, crm/internal-fields) come before ':id' routes.
  controllers: [OAuthController, FieldMappingsController, CrmToolsController, IntegrationsController],
  providers: [
    CrmHttpClient,
    HubspotAdapter,
    SalesforceAdapter,
    PipedriveAdapter,
    ZohoAdapter,
    GenericApiAdapter,
    CrmAdapterRegistry,
    CrmToolSeederService,
    OAuthTokenClient,
    OAuthService,
    IntegrationCredentialsService,
    IntegrationStatusService,
    CrmService,
    CrmToolsService,
    FieldMappingsService,
    IntegrationsService,
  ],
  exports: [CrmService, IntegrationCredentialsService],
})
export class IntegrationsModule {}
