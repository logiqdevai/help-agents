import { BadRequestException, Injectable } from '@nestjs/common';
import { CrmRecordType, CrmTool, Integration } from 'generated/prisma';
import { CrmLookupQuery, CrmRecord } from '../interfaces/crm.interface';
import { CrmHttpClient, CrmHttpError } from '../http/crm-http.client';
import { IntegrationCredentialsService } from '../../services/integration-credentials.service';
import { BaseCrmAdapter } from './base-crm.adapter';
import {
  CrmAdapter,
  CrmFieldInfo,
  CrmNoteParams,
  CrmTaskParams,
  CrmUpdateParams,
  asProperties,
  digitsOnly,
  isoDate,
  requireInput,
} from './crm-adapter.interface';

const OBJECTS: Record<CrmRecordType, string> = {
  CONTACT: 'contacts',
  LEAD: 'contacts',
  COMPANY: 'companies',
  DEAL: 'deals',
  OTHER: 'contacts',
};

const PROPERTIES: Record<string, string[]> = {
  contacts: ['firstname', 'lastname', 'email', 'phone', 'mobilephone', 'hs_lead_status', 'lifecyclestage', 'hubspot_owner_id'],
  companies: ['name', 'domain', 'phone'],
  deals: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate'],
};

// HubSpot-defined association type ids (engagement -> object).
const ASSOCIATION_TYPE: Record<string, Record<string, number>> = {
  notes: { contacts: 202, companies: 190, deals: 214 },
  tasks: { contacts: 204, companies: 192, deals: 216 },
  calls: { contacts: 194, companies: 182, deals: 206 },
};

const enc = encodeURIComponent;

@Injectable()
export class HubspotAdapter extends BaseCrmAdapter implements CrmAdapter {
  readonly defaultRecordType = CrmRecordType.CONTACT;

  constructor(http: CrmHttpClient, credentials: IntegrationCredentialsService) {
    super(http, credentials);
  }

  protected resolveBaseUrl(): string {
    return 'https://api.hubapi.com';
  }

  objectName(recordType: CrmRecordType): string {
    return OBJECTS[recordType] ?? 'contacts';
  }

  async testConnection(integration: Integration): Promise<void> {
    await this.call(integration, 'GET', '/crm/v3/objects/contacts', { params: { limit: 1 } });
  }

  async lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null> {
    const type = query.record_type ?? this.defaultRecordType;
    const object = this.objectName(type);
    const properties = PROPERTIES[object];

    if (query.external_id) {
      try {
        const res = await this.call(integration, 'GET', `/crm/v3/objects/${object}/${enc(query.external_id)}`, {
          params: { properties: properties.join(',') },
        });
        return this.toRecord(integration, res.data, type, object);
      } catch (error) {
        if (error instanceof CrmHttpError && error.isNotFound) return null;
        throw error;
      }
    }

    const filterGroups: any[] = [];
    if (object === 'contacts' || object === 'companies') {
      if (query.phone) {
        const variants = [...new Set([query.phone, digitsOnly(query.phone)])];
        for (const property of object === 'contacts' ? ['phone', 'mobilephone'] : ['phone']) {
          for (const value of variants) {
            filterGroups.push({ filters: [{ propertyName: property, operator: 'EQ', value }] });
          }
        }
      }
      if (query.email && object === 'contacts') {
        filterGroups.push({ filters: [{ propertyName: 'email', operator: 'EQ', value: query.email }] });
      }
    }
    if (!filterGroups.length) return null;

    const res = await this.call(integration, 'POST', `/crm/v3/objects/${object}/search`, {
      data: { filterGroups: filterGroups.slice(0, 5), properties, limit: 1 },
    });
    const hit = res.data?.results?.[0];
    return hit ? this.toRecord(integration, hit, type, object) : null;
  }

  async updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown> {
    const object = this.objectName(params.record_type);
    const res = await this.call(integration, 'PATCH', `/crm/v3/objects/${object}/${enc(params.external_id)}`, {
      data: { properties: params.properties },
    });
    return { id: res.data?.id ?? params.external_id, updated: Object.keys(params.properties) };
  }

  async addNote(integration: Integration, params: CrmNoteParams): Promise<unknown> {
    return this.createEngagement(integration, 'notes', params.record_type, params.external_id, {
      hs_note_body: params.note,
      hs_timestamp: new Date().toISOString(),
    });
  }

  async createTask(integration: Integration, params: CrmTaskParams): Promise<unknown> {
    return this.createEngagement(integration, 'tasks', params.record_type, params.external_id, {
      hs_task_subject: params.title,
      hs_task_body: params.notes ?? '',
      hs_task_status: 'NOT_STARTED',
      hs_timestamp: isoDate(params.due_at) ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
  }

  async listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const res = await this.call(integration, 'GET', `/crm/v3/properties/${this.objectName(recordType)}`);
    return (res.data?.results ?? []).map((p: any) => ({ name: p.name, label: p.label ?? p.name, type: p.type }));
  }

  async executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown> {
    switch (tool.key) {
      case 'hubspot_lookup_contact':
        return this.lookupContact(integration, {
          phone: input.phone,
          email: input.email,
          external_id: input.contact_id,
          record_type: CrmRecordType.CONTACT,
        });
      case 'hubspot_lookup_deal':
        return this.lookupDeals(integration, input);
      case 'hubspot_update_contact':
        requireInput(input, 'contact_id', 'properties');
        return this.updateRecord(integration, {
          external_id: String(input.contact_id),
          record_type: CrmRecordType.CONTACT,
          properties: asProperties(input.properties),
        });
      case 'hubspot_update_deal_stage':
        requireInput(input, 'deal_id', 'stage');
        return this.updateRecord(integration, {
          external_id: String(input.deal_id),
          record_type: CrmRecordType.DEAL,
          properties: { dealstage: input.stage },
        });
      case 'hubspot_add_note_to_contact':
        requireInput(input, 'contact_id', 'note');
        return this.addNote(integration, {
          external_id: String(input.contact_id),
          record_type: CrmRecordType.CONTACT,
          note: String(input.note),
        });
      case 'hubspot_log_activity':
        requireInput(input, 'contact_id', 'body');
        return this.createEngagement(integration, 'calls', CrmRecordType.CONTACT, String(input.contact_id), {
          hs_call_title: input.subject ?? 'AI call',
          hs_call_body: String(input.body),
          hs_call_status: 'COMPLETED',
          hs_timestamp: new Date().toISOString(),
        });
      case 'hubspot_update_custom_property':
        requireInput(input, 'contact_id', 'property', 'value');
        return this.updateRecord(integration, {
          external_id: String(input.contact_id),
          record_type: CrmRecordType.CONTACT,
          properties: { [String(input.property)]: input.value },
        });
      case 'hubspot_create_task':
        requireInput(input, 'contact_id', 'title');
        return this.createTask(integration, {
          external_id: String(input.contact_id),
          record_type: CrmRecordType.CONTACT,
          title: String(input.title),
          due_at: input.due_at,
          notes: input.notes,
        });
      default:
        throw new BadRequestException(`Unsupported HubSpot tool: ${tool.key}`);
    }
  }

  private async lookupDeals(integration: Integration, input: Record<string, any>): Promise<unknown> {
    const properties = PROPERTIES.deals;
    if (input.deal_id) {
      const res = await this.call(integration, 'GET', `/crm/v3/objects/deals/${enc(String(input.deal_id))}`, {
        params: { properties: properties.join(',') },
      });
      return this.toRecord(integration, res.data, CrmRecordType.DEAL, 'deals');
    }

    if (input.contact_id) {
      const assoc = await this.call(
        integration,
        'GET',
        `/crm/v4/objects/contacts/${enc(String(input.contact_id))}/associations/deals`,
      );
      const ids: string[] = (assoc.data?.results ?? []).slice(0, 5).map((r: any) => String(r.toObjectId));
      if (!ids.length) return [];
      const res = await this.call(integration, 'POST', '/crm/v3/objects/deals/batch/read', {
        data: { properties, inputs: ids.map((id) => ({ id })) },
      });
      return (res.data?.results ?? []).map((r: any) => this.toRecord(integration, r, CrmRecordType.DEAL, 'deals'));
    }

    requireInput(input, 'query');
    const res = await this.call(integration, 'POST', '/crm/v3/objects/deals/search', {
      data: {
        query: String(input.query),
        properties,
        limit: 5,
      },
    });
    return (res.data?.results ?? []).map((r: any) => this.toRecord(integration, r, CrmRecordType.DEAL, 'deals'));
  }

  private async createEngagement(
    integration: Integration,
    engagement: 'notes' | 'tasks' | 'calls',
    recordType: CrmRecordType,
    externalId: string,
    properties: Record<string, any>,
  ): Promise<unknown> {
    const target = this.objectName(recordType);
    const res = await this.call(integration, 'POST', `/crm/v3/objects/${engagement}`, {
      data: {
        properties,
        associations: [
          {
            to: { id: externalId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: ASSOCIATION_TYPE[engagement][target] ?? ASSOCIATION_TYPE[engagement].contacts,
              },
            ],
          },
        ],
      },
    });
    return { id: res.data?.id };
  }

  private toRecord(integration: Integration, raw: any, type: CrmRecordType, object: string): CrmRecord {
    const p = raw?.properties ?? {};
    const name =
      object === 'contacts'
        ? [p.firstname, p.lastname].filter(Boolean).join(' ') || p.email || null
        : (p.name ?? p.dealname ?? null);
    const portal = (integration.config as any)?.portal_id;
    const typeSegment = object === 'contacts' ? '0-1' : object === 'companies' ? '0-2' : '0-3';

    return {
      external_id: String(raw.id),
      record_type: type,
      name,
      phone: p.phone || p.mobilephone || null,
      email: p.email ?? null,
      url: portal ? `https://app.hubspot.com/contacts/${portal}/record/${typeSegment}/${raw.id}` : null,
      properties: p,
    };
  }
}
