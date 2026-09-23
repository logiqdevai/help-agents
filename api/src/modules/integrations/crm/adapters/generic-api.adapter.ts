import { BadRequestException, Injectable } from '@nestjs/common';
import { CrmRecordType, CrmTool, Integration } from 'generated/prisma';
import { Method } from 'axios';
import { CrmLookupQuery, CrmRecord } from '../interfaces/crm.interface';
import { CrmHttpClient, CrmHttpError } from '../http/crm-http.client';
import { IntegrationCredentialsService } from '../../services/integration-credentials.service';
import { BaseCrmAdapter } from './base-crm.adapter';
import { getPath, renderPath, renderTemplate } from '../../utils/template.utils';
import {
  CrmAdapter,
  CrmFieldInfo,
  CrmNoteParams,
  CrmTaskParams,
  CrmUpdateParams,
} from './crm-adapter.interface';

/** `{placeholder}` templated HTTP call. Path values are URL-encoded; empty query/body values are dropped. */
export interface EndpointSpec {
  method?: string;
  path: string;
  query?: Record<string, any>;
  body?: any;
}

export interface GenericApiConfig {
  test?: EndpointSpec;
  /** Vars: phone, email, external_id, record_type. `result_path` locates the record in the response. */
  lookup?: EndpointSpec & {
    result_path?: string;
    id_path?: string;
    name_path?: string;
    phone_path?: string;
    email_path?: string;
    url_path?: string;
  };
  /** Vars: external_id, record_type, properties. */
  update?: EndpointSpec;
  /** Vars: external_id, record_type, note. */
  note?: EndpointSpec;
  /** Vars: external_id, record_type, title, due_at, notes. */
  task?: EndpointSpec;
  fields?: EndpointSpec & { result_path?: string; name_path?: string; label_path?: string; type_path?: string };
}

/** Stored under `CrmTool.input_schema['x-http']` for user-defined tools. */
export const TOOL_HTTP_KEY = 'x-http';

@Injectable()
export class GenericApiAdapter extends BaseCrmAdapter implements CrmAdapter {
  readonly defaultRecordType = CrmRecordType.CONTACT;

  constructor(http: CrmHttpClient, credentials: IntegrationCredentialsService) {
    super(http, credentials);
  }

  protected resolveBaseUrl(integration: Integration): string {
    if (!integration.base_url) throw new BadRequestException('The connection has no base URL');
    return integration.base_url;
  }

  protected guardRequests(): boolean {
    return true;
  }

  objectName(recordType: CrmRecordType): string {
    return recordType.toLowerCase();
  }

  async testConnection(integration: Integration): Promise<void> {
    const spec = this.config(integration).test ?? { method: 'GET', path: '/' };
    await this.run(integration, spec, {});
  }

  async lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null> {
    const spec = this.config(integration).lookup;
    if (!spec) return null;

    let data: any;
    try {
      data = await this.run(integration, spec, { ...query, record_type: query.record_type ?? this.defaultRecordType });
    } catch (error) {
      if (error instanceof CrmHttpError && error.isNotFound) return null;
      throw error;
    }

    const raw = spec.result_path ? getPath(data, spec.result_path) : data;
    const record = Array.isArray(raw) ? raw[0] : raw;
    if (!record || typeof record !== 'object') return null;

    const id = getPath(record, spec.id_path ?? 'id');
    if (id == null) return null;

    return {
      external_id: String(id),
      record_type: query.record_type ?? this.defaultRecordType,
      name: getPath(record, spec.name_path ?? 'name') ?? null,
      phone: getPath(record, spec.phone_path ?? 'phone') ?? null,
      email: getPath(record, spec.email_path ?? 'email') ?? null,
      url: getPath(record, spec.url_path ?? 'url') ?? null,
      properties: record,
    };
  }

  async updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown> {
    const spec = this.config(integration).update;
    if (!spec) throw new BadRequestException('This connection has no "update" endpoint configured');
    await this.run(integration, spec, { ...params });
    return { id: params.external_id, updated: Object.keys(params.properties) };
  }

  async addNote(integration: Integration, params: CrmNoteParams): Promise<unknown> {
    const spec = this.config(integration).note;
    if (!spec) throw new BadRequestException('This connection has no "note" endpoint configured');
    return this.run(integration, spec, { ...params });
  }

  async createTask(integration: Integration, params: CrmTaskParams): Promise<unknown> {
    const spec = this.config(integration).task;
    if (!spec) throw new BadRequestException('This connection has no "task" endpoint configured');
    return this.run(integration, spec, { ...params });
  }

  async listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const spec = this.config(integration).fields;
    if (!spec) return [];
    const data = await this.run(integration, spec, { record_type: recordType });
    const list = spec.result_path ? getPath(data, spec.result_path) : data;
    if (!Array.isArray(list)) return [];
    return list.map((f: any) =>
      typeof f === 'string'
        ? { name: f, label: f }
        : {
            name: String(getPath(f, spec.name_path ?? 'name')),
            label: String(getPath(f, spec.label_path ?? 'label') ?? getPath(f, spec.name_path ?? 'name')),
            type: getPath(f, spec.type_path ?? 'type'),
          },
    );
  }

  async executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown> {
    const http = (tool.input_schema as any)?.[TOOL_HTTP_KEY] as EndpointSpec | undefined;
    if (!http?.path) throw new BadRequestException(`Tool "${tool.key}" has no HTTP definition`);
    return this.run(integration, http, input);
  }

  private config(integration: Integration): GenericApiConfig {
    const raw = integration.config;
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as GenericApiConfig) : {};
  }

  private async run(integration: Integration, spec: EndpointSpec, vars: Record<string, any>): Promise<any> {
    const method = (spec.method ?? 'GET').toUpperCase() as Method;
    const query = spec.query ? renderTemplate(spec.query, vars) : undefined;
    const body = spec.body !== undefined && method !== 'GET' ? renderTemplate(spec.body, vars) : undefined;

    const res = await this.call(integration, method, renderPath(spec.path, vars), { params: query, data: body });
    return res.data;
  }
}
