import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
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

const API_VERSION = 'v59.0';

const OBJECTS: Record<CrmRecordType, string> = {
  CONTACT: 'Contact',
  LEAD: 'Lead',
  COMPANY: 'Account',
  DEAL: 'Opportunity',
  OTHER: 'Lead',
};

const RECORD_TYPE_BY_OBJECT: Record<string, CrmRecordType> = {
  Contact: CrmRecordType.CONTACT,
  Lead: CrmRecordType.LEAD,
  Account: CrmRecordType.COMPANY,
  Opportunity: CrmRecordType.DEAL,
};

const FIELDS: Record<string, string[]> = {
  Lead: ['Id', 'Name', 'FirstName', 'LastName', 'Company', 'Phone', 'MobilePhone', 'Email', 'Status'],
  Contact: ['Id', 'Name', 'FirstName', 'LastName', 'Phone', 'MobilePhone', 'Email'],
  Account: ['Id', 'Name', 'Phone'],
  Opportunity: ['Id', 'Name', 'StageName', 'Amount', 'CloseDate'],
};

const ID_PREFIX_TO_OBJECT: Record<string, string> = { '00Q': 'Lead', '003': 'Contact', '006': 'Opportunity', '001': 'Account' };

const enc = encodeURIComponent;

function soqlEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function soslEscape(value: string): string {
  return value.replace(/[?&|!{}[\]()^~*:\\"'+\-]/g, '\\$&');
}

@Injectable()
export class SalesforceAdapter extends BaseCrmAdapter implements CrmAdapter {
  readonly defaultRecordType = CrmRecordType.LEAD;

  constructor(http: CrmHttpClient, credentials: IntegrationCredentialsService) {
    super(http, credentials);
  }

  protected resolveBaseUrl(integration: Integration, credentials: StoredCredentials): string {
    const instance = credentials.instance_url ?? integration.base_url;
    if (!instance) throw new ServiceUnavailableException('Salesforce instance URL is missing; reconnect the integration');
    return `${instance.replace(/\/+$/, '')}/services/data/${API_VERSION}`;
  }

  objectName(recordType: CrmRecordType): string {
    return OBJECTS[recordType] ?? 'Lead';
  }

  async testConnection(integration: Integration): Promise<void> {
    await this.call(integration, 'GET', '/limits');
  }

  async lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null> {
    const objects = query.record_type
      ? [this.objectName(query.record_type)]
      : [OBJECTS[this.defaultRecordType], 'Contact'];

    if (query.external_id) {
      const object = query.record_type ? objects[0] : (ID_PREFIX_TO_OBJECT[query.external_id.slice(0, 3)] ?? objects[0]);
      try {
        const res = await this.call(integration, 'GET', `/sobjects/${object}/${enc(query.external_id)}`, {
          params: { fields: FIELDS[object].join(',') },
        });
        return this.toRecord(integration, res.data, object);
      } catch (error) {
        if (error instanceof CrmHttpError && (error.isNotFound || error.status === 400)) return null;
        throw error;
      }
    }

    if (query.phone) {
      const digits = digitsOnly(query.phone);
      if (digits) {
        const returning = objects.map((o) => `${o}(${FIELDS[o].join(',')})`).join(', ');
        const sosl = `FIND {${soslEscape(digits)}} IN PHONE FIELDS RETURNING ${returning} LIMIT 5`;
        const res = await this.call(integration, 'GET', '/search', { params: { q: sosl } });
        const hits: any[] = res.data?.searchRecords ?? [];
        const ordered = objects.flatMap((o) => hits.filter((h) => h.attributes?.type === o));
        if (ordered[0]) return this.toRecord(integration, ordered[0], ordered[0].attributes.type);
      }
    }

    if (query.email) {
      for (const object of objects) {
        const soql = `SELECT ${FIELDS[object].join(',')} FROM ${object} WHERE Email = '${soqlEscape(query.email)}' LIMIT 1`;
        const res = await this.call(integration, 'GET', '/query', { params: { q: soql } });
        const hit = res.data?.records?.[0];
        if (hit) return this.toRecord(integration, hit, object);
      }
    }
    return null;
  }

  async updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown> {
    const object = this.objectFor(params.external_id, params.record_type);
    await this.call(integration, 'PATCH', `/sobjects/${object}/${enc(params.external_id)}`, { data: params.properties });
    return { id: params.external_id, updated: Object.keys(params.properties) };
  }

  async addNote(integration: Integration, params: CrmNoteParams): Promise<unknown> {
    const note = await this.call(integration, 'POST', '/sobjects/ContentNote', {
      data: {
        Title: params.note.split('\n')[0].slice(0, 80) || 'AI call note',
        Content: Buffer.from(params.note.replace(/\n/g, '<br>')).toString('base64'),
      },
    });
    await this.call(integration, 'POST', '/sobjects/ContentDocumentLink', {
      data: { ContentDocumentId: note.data.id, LinkedEntityId: params.external_id, ShareType: 'V' },
    });
    return { id: note.data.id };
  }

  async createTask(integration: Integration, params: CrmTaskParams): Promise<unknown> {
    return this.createTaskRecord(integration, params.external_id, {
      Subject: params.title,
      Description: params.notes,
      Status: 'Not Started',
      ActivityDate: this.dateOnly(params.due_at ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString()),
    });
  }

  async listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const res = await this.call(integration, 'GET', `/sobjects/${this.objectName(recordType)}/describe`);
    return (res.data?.fields ?? []).map((f: any) => ({ name: f.name, label: f.label ?? f.name, type: f.type }));
  }

  async executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown> {
    switch (tool.key) {
      case 'salesforce_lookup_lead':
        return this.lookupContact(integration, {
          phone: input.phone,
          email: input.email,
          external_id: input.lead_id,
          record_type: CrmRecordType.LEAD,
        });
      case 'salesforce_lookup_opportunity':
        return this.lookupOpportunity(integration, input);
      case 'salesforce_update_lead':
        requireInput(input, 'lead_id', 'fields');
        return this.updateRecord(integration, {
          external_id: String(input.lead_id),
          record_type: CrmRecordType.LEAD,
          properties: asProperties(input.fields),
        });
      case 'salesforce_update_opportunity_stage':
        requireInput(input, 'opportunity_id', 'stage');
        return this.updateRecord(integration, {
          external_id: String(input.opportunity_id),
          record_type: CrmRecordType.DEAL,
          properties: { StageName: input.stage },
        });
      case 'salesforce_add_note':
        requireInput(input, 'record_id', 'note');
        return this.addNote(integration, {
          external_id: String(input.record_id),
          record_type: CrmRecordType.LEAD,
          note: String(input.note),
        });
      case 'salesforce_log_call':
        requireInput(input, 'record_id', 'subject');
        return this.createTaskRecord(integration, String(input.record_id), {
          Subject: input.subject,
          Description: input.description,
          Status: 'Completed',
          TaskSubtype: 'Call',
          CallType: 'Outbound',
          CallDurationInSeconds: input.duration_seconds,
          ActivityDate: this.dateOnly(new Date().toISOString()),
        });
      case 'salesforce_update_custom_field':
        requireInput(input, 'record_id', 'field', 'value');
        return this.updateRecord(integration, {
          external_id: String(input.record_id),
          record_type: this.recordTypeFor(String(input.record_id)),
          properties: { [String(input.field)]: input.value },
        });
      case 'salesforce_create_follow_up_task':
        requireInput(input, 'record_id', 'subject');
        return this.createTask(integration, {
          external_id: String(input.record_id),
          record_type: this.recordTypeFor(String(input.record_id)),
          title: String(input.subject),
          due_at: input.due_at,
          notes: input.description,
        });
      default:
        throw new BadRequestException(`Unsupported Salesforce tool: ${tool.key}`);
    }
  }

  private async lookupOpportunity(integration: Integration, input: Record<string, any>): Promise<unknown> {
    const fields = FIELDS.Opportunity.join(',');
    if (input.opportunity_id) {
      const res = await this.call(integration, 'GET', `/sobjects/Opportunity/${enc(String(input.opportunity_id))}`, {
        params: { fields },
      });
      return this.toRecord(integration, res.data, 'Opportunity');
    }
    requireInput(input, 'name');
    const soql = `SELECT ${fields} FROM Opportunity WHERE Name LIKE '%${soqlEscape(String(input.name))}%' LIMIT 5`;
    const res = await this.call(integration, 'GET', '/query', { params: { q: soql } });
    return (res.data?.records ?? []).map((r: any) => this.toRecord(integration, r, 'Opportunity'));
  }

  private async createTaskRecord(
    integration: Integration,
    recordId: string,
    fields: Record<string, any>,
  ): Promise<unknown> {
    const object = ID_PREFIX_TO_OBJECT[recordId.slice(0, 3)];
    const link = object === 'Lead' || object === 'Contact' ? { WhoId: recordId } : { WhatId: recordId };
    const clean = Object.fromEntries(Object.entries({ ...fields, ...link }).filter(([, v]) => v != null && v !== ''));
    const res = await this.call(integration, 'POST', '/sobjects/Task', { data: clean });
    return { id: res.data?.id };
  }

  private objectFor(externalId: string, recordType: CrmRecordType): string {
    return ID_PREFIX_TO_OBJECT[externalId.slice(0, 3)] ?? this.objectName(recordType);
  }

  private recordTypeFor(externalId: string): CrmRecordType {
    return RECORD_TYPE_BY_OBJECT[ID_PREFIX_TO_OBJECT[externalId.slice(0, 3)]] ?? CrmRecordType.LEAD;
  }

  private dateOnly(iso: string): string {
    const d = new Date(iso);
    return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10);
  }

  private toRecord(integration: Integration, raw: any, object: string): CrmRecord {
    const { attributes, ...properties } = raw ?? {};
    const instance = (integration.base_url ?? '').replace(/\/+$/, '');
    return {
      external_id: String(raw.Id),
      record_type: RECORD_TYPE_BY_OBJECT[object] ?? CrmRecordType.OTHER,
      name: raw.Name ?? null,
      phone: raw.Phone || raw.MobilePhone || null,
      email: raw.Email ?? null,
      url: instance ? `${instance}/lightning/r/${object}/${raw.Id}/view` : null,
      properties,
    };
  }
}
