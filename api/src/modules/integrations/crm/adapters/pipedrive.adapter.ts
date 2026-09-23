import { BadRequestException, Injectable } from '@nestjs/common';
import { CrmRecordType, CrmTool, Integration } from 'generated/prisma';
import { CrmLookupQuery, CrmRecord } from '../interfaces/crm.interface';
import { CrmHttpClient, CrmHttpError } from '../http/crm-http.client';
import { IntegrationCredentialsService } from '../../services/integration-credentials.service';
import { StoredCredentials } from '../../interfaces/integration.interface';
import { BaseCrmAdapter } from './base-crm.adapter';
import {
  CrmAdapter,
  CrmFieldInfo,
  CrmNoteParams,
  CrmTaskParams,
  CrmUpdateParams,
  asProperties,
  digitsOnly,
  requireInput,
} from './crm-adapter.interface';

// Leads are handled as persons.
const OBJECTS: Record<CrmRecordType, string> = {
  CONTACT: 'persons',
  LEAD: 'persons',
  COMPANY: 'organizations',
  DEAL: 'deals',
  OTHER: 'persons',
};

const FIELD_ENDPOINTS: Record<string, string> = {
  persons: 'personFields',
  organizations: 'organizationFields',
  deals: 'dealFields',
};

const ACTIVITY_LINK_KEY: Record<string, string> = { persons: 'person_id', organizations: 'org_id', deals: 'deal_id' };

const enc = encodeURIComponent;

@Injectable()
export class PipedriveAdapter extends BaseCrmAdapter implements CrmAdapter {
  readonly defaultRecordType = CrmRecordType.CONTACT;

  constructor(http: CrmHttpClient, credentials: IntegrationCredentialsService) {
    super(http, credentials);
  }

  protected resolveBaseUrl(_integration: Integration, credentials: StoredCredentials): string {
    return credentials.api_domain ?? 'https://api.pipedrive.com';
  }

  objectName(recordType: CrmRecordType): string {
    return OBJECTS[recordType] ?? 'persons';
  }

  async testConnection(integration: Integration): Promise<void> {
    await this.call(integration, 'GET', '/api/v1/users/me');
  }

  async lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null> {
    const type = query.record_type ?? this.defaultRecordType;
    const object = this.objectName(type);

    if (query.external_id) {
      try {
        const res = await this.call(integration, 'GET', `/api/v1/${object}/${enc(query.external_id)}`);
        return res.data?.data ? this.toRecord(integration, res.data.data, type, object) : null;
      } catch (error) {
        if (error instanceof CrmHttpError && error.isNotFound) return null;
        throw error;
      }
    }
    if (object !== 'persons') return null;

    const attempts: Array<{ term: string; fields: string }> = [];
    if (query.phone) {
      attempts.push({ term: query.phone, fields: 'phone' });
      const digits = digitsOnly(query.phone);
      if (digits && digits !== query.phone) attempts.push({ term: digits, fields: 'phone' });
    }
    if (query.email) attempts.push({ term: query.email, fields: 'email' });

    for (const attempt of attempts) {
      const res = await this.call(integration, 'GET', '/api/v1/persons/search', {
        params: { term: attempt.term, fields: attempt.fields, exact_match: true, limit: 1 },
      });
      const id = res.data?.data?.items?.[0]?.item?.id;
      if (id) {
        const full = await this.call(integration, 'GET', `/api/v1/persons/${id}`);
        return this.toRecord(integration, full.data.data, type, object);
      }
    }
    return null;
  }

  async updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown> {
    const object = this.objectName(params.record_type);
    await this.call(integration, 'PUT', `/api/v1/${object}/${enc(params.external_id)}`, { data: params.properties });
    return { id: params.external_id, updated: Object.keys(params.properties) };
  }

  async addNote(integration: Integration, params: CrmNoteParams): Promise<unknown> {
    const link = ACTIVITY_LINK_KEY[this.objectName(params.record_type)] ?? 'person_id';
    const res = await this.call(integration, 'POST', '/api/v1/notes', {
      data: { content: params.note.replace(/\n/g, '<br>'), [link]: Number(params.external_id) },
    });
    return { id: res.data?.data?.id };
  }

  async createTask(integration: Integration, params: CrmTaskParams): Promise<unknown> {
    const link = ACTIVITY_LINK_KEY[this.objectName(params.record_type)] ?? 'person_id';
    return this.createActivity(integration, {
      subject: params.title,
      type: 'task',
      note: params.notes,
      due_date: params.due_at ? new Date(params.due_at).toISOString().slice(0, 10) : undefined,
      done: 0,
      [link]: Number(params.external_id),
    });
  }

  async listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const endpoint = FIELD_ENDPOINTS[this.objectName(recordType)];
    const res = await this.call(integration, 'GET', `/api/v1/${endpoint}`);
    return (res.data?.data ?? []).map((f: any) => ({ name: f.key, label: f.name ?? f.key, type: f.field_type }));
  }

  async executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown> {
    switch (tool.key) {
      case 'pipedrive_lookup_person':
        return this.lookupContact(integration, {
          phone: input.phone,
          email: input.email,
          external_id: input.person_id,
          record_type: CrmRecordType.CONTACT,
        });
      case 'pipedrive_lookup_deal':
        return this.lookupDeals(integration, input);
      case 'pipedrive_update_person':
        requireInput(input, 'person_id', 'fields');
        return this.updateRecord(integration, {
          external_id: String(input.person_id),
          record_type: CrmRecordType.CONTACT,
          properties: asProperties(input.fields),
        });
      case 'pipedrive_update_deal_stage':
        requireInput(input, 'deal_id', 'stage_id');
        return this.updateRecord(integration, {
          external_id: String(input.deal_id),
          record_type: CrmRecordType.DEAL,
          properties: { stage_id: Number(input.stage_id) },
        });
      case 'pipedrive_add_note': {
        if (!input.person_id && !input.deal_id) throw new BadRequestException('Provide person_id or deal_id');
        requireInput(input, 'content');
        const isDeal = !input.person_id;
        return this.addNote(integration, {
          external_id: String(input.person_id ?? input.deal_id),
          record_type: isDeal ? CrmRecordType.DEAL : CrmRecordType.CONTACT,
          note: String(input.content),
        });
      }
      case 'pipedrive_log_activity':
        requireInput(input, 'person_id', 'subject');
        return this.createActivity(integration, {
          subject: input.subject,
          type: input.type ?? 'call',
          note: input.note,
          done: input.done === false ? 0 : 1,
          person_id: Number(input.person_id),
        });
      case 'pipedrive_update_custom_field':
        requireInput(input, 'person_id', 'field_key', 'value');
        return this.updateRecord(integration, {
          external_id: String(input.person_id),
          record_type: CrmRecordType.CONTACT,
          properties: { [String(input.field_key)]: input.value },
        });
      case 'pipedrive_create_task':
        requireInput(input, 'person_id', 'subject');
        return this.createTask(integration, {
          external_id: String(input.person_id),
          record_type: CrmRecordType.CONTACT,
          title: String(input.subject),
          due_at: input.due_date,
          notes: input.note,
        });
      default:
        throw new BadRequestException(`Unsupported Pipedrive tool: ${tool.key}`);
    }
  }

  private async lookupDeals(integration: Integration, input: Record<string, any>): Promise<unknown> {
    if (input.deal_id) {
      const res = await this.call(integration, 'GET', `/api/v1/deals/${enc(String(input.deal_id))}`);
      return res.data?.data ? this.toRecord(integration, res.data.data, CrmRecordType.DEAL, 'deals') : null;
    }
    if (input.person_id) {
      const res = await this.call(integration, 'GET', `/api/v1/persons/${enc(String(input.person_id))}/deals`, {
        params: { limit: 5 },
      });
      return (res.data?.data ?? []).map((d: any) => this.toRecord(integration, d, CrmRecordType.DEAL, 'deals'));
    }
    requireInput(input, 'title');
    const res = await this.call(integration, 'GET', '/api/v1/deals/search', {
      params: { term: String(input.title), limit: 5 },
    });
    return (res.data?.data?.items ?? []).map((i: any) => this.toRecord(integration, i.item, CrmRecordType.DEAL, 'deals'));
  }

  private async createActivity(integration: Integration, data: Record<string, any>): Promise<unknown> {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v != null && v !== ''));
    const res = await this.call(integration, 'POST', '/api/v1/activities', { data: clean });
    return { id: res.data?.data?.id };
  }

  private toRecord(integration: Integration, raw: any, type: CrmRecordType, object: string): CrmRecord {
    const primary = (list: any) =>
      Array.isArray(list) ? (list.find((v: any) => v?.primary)?.value ?? list[0]?.value ?? null) : (list ?? null);
    const base = this.knownBase(integration);
    const segment = object === 'persons' ? 'person' : object === 'organizations' ? 'organization' : 'deal';

    return {
      external_id: String(raw.id),
      record_type: type,
      name: raw.name ?? raw.title ?? null,
      phone: primary(raw.phone) || null,
      email: primary(raw.email) || null,
      url: base ? `${base}/${segment}/${raw.id}` : null,
      properties: raw,
    };
  }

  private knownBase(integration: Integration): string | null {
    const domain = (integration.config as any)?.company_domain;
    return typeof domain === 'string' && domain ? `https://${domain}.pipedrive.com` : null;
  }
}
