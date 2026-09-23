import { BadRequestException, Injectable } from '@nestjs/common';
import { IntegrationProvider } from 'generated/prisma';
import { CrmAdapter } from './crm-adapter.interface';
import { HubspotAdapter } from './hubspot.adapter';
import { SalesforceAdapter } from './salesforce.adapter';
import { PipedriveAdapter } from './pipedrive.adapter';
import { ZohoAdapter } from './zoho.adapter';
import { GenericApiAdapter } from './generic-api.adapter';

/** Adding a CRM = one adapter class + one entry here + catalogue tools; nothing else changes. */
@Injectable()
export class CrmAdapterRegistry {
  private readonly adapters: Partial<Record<IntegrationProvider, CrmAdapter>>;

  constructor(
    hubspot: HubspotAdapter,
    salesforce: SalesforceAdapter,
    pipedrive: PipedriveAdapter,
    zoho: ZohoAdapter,
    generic: GenericApiAdapter,
  ) {
    this.adapters = {
      [IntegrationProvider.HUBSPOT]: hubspot,
      [IntegrationProvider.SALESFORCE]: salesforce,
      [IntegrationProvider.PIPEDRIVE]: pipedrive,
      [IntegrationProvider.ZOHO]: zoho,
      [IntegrationProvider.CUSTOM_CRM]: generic,
      [IntegrationProvider.GENERIC_API]: generic,
    };
  }

  has(provider: IntegrationProvider): boolean {
    return !!this.adapters[provider];
  }

  get(provider: IntegrationProvider): CrmAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) throw new BadRequestException('This integration does not support CRM operations');
    return adapter;
  }
}
