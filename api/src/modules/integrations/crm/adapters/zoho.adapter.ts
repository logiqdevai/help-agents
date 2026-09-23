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
  requireInput,
} from './crm-adapter.interface';

const MODULES: Record<CrmRecordType, string> = {
  CONTACT: 'Contacts',
  LEAD: 'Leads',
  COMPANY: 'Accounts',
  DEAL: 'Deals',
  OTHER: 'Contacts',
};

const RECORD_TYPE_BY_MODULE: Record<string, CrmRecordType> = {
  Contacts: CrmRecordType.CONTACT,
  Leads: CrmRecordType.LEAD,
  Accounts: CrmRecordType.COMPANY,
  Deals: CrmRecordType.DEAL,
};

const enc = encodeURIComponent;

@Injectable()
export class ZohoAdapter extends BaseCrmAdapter implements CrmAdapter {
  readonly defaultRecordType = CrmRecordType.CONTACT;

  constructor(http: CrmHttpClient, credentials: IntegrationCredentialsService) {
    super(http, credentials);
  }

  protected resolveBaseUrl(_integration: Integration, credentials: StoredCredentials): string {
    return `${(credentials.api_domain ?? 'https://www.zohoapis.com').replace(/\/+$/, '')}/crm/v6`;
  }

  objectName(recordType: CrmRecordType): string {
    return MODULES[recordType] ?? 'Contacts';
  }

  async testConnection(integration: Integration): Promise<void> {
    await this.call(integration, 'GET', '/users', { params: { type: 'CurrentUser' } });
  }

  async lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null> {
    const modules = query.record_type ? [this.objectName(query.record_type)] : ['Contacts', 'Leads'];

    for (const module of modules) {
      if (query.external_id) {
        try {
          const res = await this.call(integration, 'GET', `/${module}/${enc(query.external_id)}`);
          const record = res.data?.data?.[0];
          if (record) return this.toRecord(integration, record, module);
        } catch (error) {
          if (error instanceof CrmHttpError && (error.isNotFound || error.status === 400)) continue;
          throw error;
        }
        continue;
      }

      const searches: Array<Record<string, string>> = [];
      if (query.phone) searches.push({ phone: query.phone });
      if (query.email) searches.push({ email: query.email });

      for (const params of searches) {
        const res = await this.call(integration, 'GET', `/${module}/search`, { params });
        const record = res.data?.data?.[0];
        if (record) return this.toRecord(integration, record, module);
      }
    }
    return null;
  }

  async updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown> {
    const module = this.objectName(params.record_type);
    const res = await this.call(integration, 'PUT', `/${module}/${enc(params.external_id)}`, {
      data: { data: [params.properties] },
    });
    this.assertRowSuccess(res.data);
    return { id: params.external_id, updated: Object.keys(params.properties) };
  }

  async addNote(integration: Integration, params: CrmNoteParams): Promise<unknown> {
    const module = this.objectName(params.record_type);
    const res = await this.call(integration, 'POST', '/Notes', {
      data: {
        data: [
          {
            Note_Title: params.note.split('\n')[0].slice(0, 80) || 'AI call note',
            Note_Content: params.note,
            Parent_Id: { module: { api_name: module }, id: params.external_id },
          },
        ],
      },
    });
    this.assertRowSuccess(res.data);
    return { id: res.data?.data?.[0]?.details?.id };
  }

  async createTask(integration: Integration, params: CrmTaskParams): Promise<unknown> {
    return this.createRelated(integration, 'Tasks', params.record_type, params.external_id, {
      Subject: params.title,
      Description: params.notes,
      Due_Date: (params.due_at ? new Date(params.due_at) : new Date(Date.now() + 24 * 3600 * 1000))
        .toISOString()
        .slice(0, 10),
      Status: 'Not Started',
    });
  }

  async listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const res = await this.call(integration, 'GET', '/settings/fields', {
      params: { module: this.objectName(recordType) },
    });
    return (res.data?.fields ?? []).map((f: any) => ({
      name: f.api_name,
      label: f.field_label ?? f.api_name,
      type: f.data_type,
    }));
  }

  async executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown> {
    switch (tool.key) {
      case 'zoho_lookup_lead':
        return this.lookupContact(integration, {
          phone: input.phone,
          email: input.email,
          external_id: input.lead_id,
          record_type: CrmRecordType.LEAD,
        });
      case 'zoho_lookup_deal':
        return this.lookupDeals(integration, input);
      case 'zoho_update_lead':
        requireInput(input, 'lead_id', 'fields');
        return this.updateRecord(integration, {
          external_id: String(input.lead_id),
          record_type: CrmRecordType.LEAD,
          properties: asProperties(input.fields),
        });
      case 'zoho_update_deal_stage':
        requireInput(input, 'deal_id', 'stage');
        return this.updateRecord(integration, {
          external_id: String(input.deal_id),
          record_type: CrmRecordType.DEAL,
          properties: { Stage: input.stage },
        });
      case 'zoho_add_note':
        requireInput(input, 'record_id', 'content');
        return this.addNote(integration, {
          external_id: String(input.record_id),
          record_type: this.recordTypeFrom(input.module),
          note: String(input.content),
        });
      case 'zoho_log_call':
        requireInput(input, 'record_id', 'subject');
        return this.createRelated(integration, 'Calls', this.recordTypeFrom(input.module), String(input.record_id), {
          Subject: input.subject,
          Description: input.description,
          Call_Type: 'Outbound',
          Call_Start_Time: new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00'),
          Call_Duration: this.formatDuration(input.duration_seconds),
        });
      case 'zoho_update_custom_field':
        requireInput(input, 'record_id', 'field', 'value');
        return this.updateRecord(integration, {
          external_id: String(input.record_id),
          record_type: this.recordTypeFrom(input.module),
          properties: { [String(input.field)]: input.value },
        });
      case 'zoho_create_task':
        requireInput(input, 'record_id', 'subject');
        return this.createTask(integration, {
          external_id: String(input.record_id),
          record_type: this.recordTypeFrom(input.module),
          title: String(input.subject),
          due_at: input.due_date,
          notes: input.description,
        });
      default:
        throw new BadRequestException(`Unsupported Zoho tool: ${tool.key}`);
    }
  }

  private async lookupDeals(integration: Integration, input: Record<string, any>): Promise<unknown> {
    if (input.deal_id) {
      const res = await this.call(integration, 'GET', `/Deals/${enc(String(input.deal_id))}`);
      const record = res.data?.data?.[0];
      return record ? this.toRecord(integration, record, 'Deals') : null;
    }
    requireInput(input, 'name');
    const res = await this.call(integration, 'GET', '/Deals/search', { params: { word: String(input.name), per_page: 5 } });
    return (res.data?.data ?? []).map((r: any) => this.toRecord(integration, r, 'Deals'));
  }

  private async createRelated(
    integration: Integration,
    module: 'Tasks' | 'Calls',
    recordType: CrmRecordType,
    recordId: string,
    fields: Record<string, any>,
  ): Promise<unknown> {
    const related = this.objectName(recordType);
    const link =
      related === 'Contacts' || related === 'Leads'
        ? { Who_Id: { id: recordId } }
        : { What_Id: { id: recordId }, $se_module: related };
    const clean = Object.fromEntries(Object.entries({ ...fields, ...link }).filter(([, v]) => v != null && v !== ''));

    const res = await this.call(integration, 'POST', `/${module}`, { data: { data: [clean] } });
    this.assertRowSuccess(res.data);
    return { id: res.data?.data?.[0]?.details?.id };
  }

  private assertRowSuccess(body: any): void {
    const row = body?.data?.[0];
    if (row && row.status && row.status !== 'success') {
      throw new CrmHttpError(`Zoho rejected the request: ${row.message ?? row.code ?? 'unknown error'}`, 400, row);
    }
  }

  private recordTypeFrom(module?: string): CrmRecordType {
    return (module && RECORD_TYPE_BY_MODULE[module]) || CrmRecordType.LEAD;
  }

  private formatDuration(seconds?: number): string {
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  private toRecord(_integration: Integration, raw: any, module: string): CrmRecord {
    return {
      external_id: String(raw.id),
      record_type: RECORD_TYPE_BY_MODULE[module] ?? CrmRecordType.OTHER,
      name: raw.Full_Name ?? raw.Deal_Name ?? raw.Account_Name ?? raw.Last_Name ?? null,
      phone: raw.Phone || raw.Mobile || null,
      email: raw.Email ?? null,
      url: null,
      properties: raw,
    };
  }
}
