import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Contact,
  CrmFieldMapping,
  CrmRecordType,
  CrmTool,
  Integration,
  IntegrationCategory,
  IntegrationStatus,
  MappingDirection,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
  CANONICAL_ACTION_KEYS,
  GOAL_FIELD_PREFIX,
  INTERNAL_CRM_FIELDS,
  personalizationVariableKey,
} from '@/shared/constants/crm-fields';
import { CrmAdapterRegistry } from './adapters/crm-adapter.registry';
import { CrmAdapter, CrmFieldInfo } from './adapters/crm-adapter.interface';
import { CrmHttpError } from './http/crm-http.client';
import { IntegrationStatusService } from '../services/integration-status.service';
import { applyTransform, dropOverridden, isBlank } from '../utils/mapping.utils';
import { getPath, toStringValue } from '../utils/template.utils';
import {
  CrmCallResultInput,
  CrmExecuteToolInput,
  CrmExecuteToolResult,
  CrmLookupQuery,
  CrmRecord,
} from './interfaces/crm.interface';

const UNKNOWN = 'unknown';
const ID_KEYS = ['contact_id', 'lead_id', 'person_id', 'record_id'];
const OTHER_IDENTIFIERS = ['deal_id', 'opportunity_id', 'phone', 'email', 'query', 'name', 'title'];

interface CallContext {
  call_uuid?: string;
  contact?: {
    id?: string;
    external_id?: string | null;
    record_type?: CrmRecordType;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

interface RecordRef {
  external_id: string;
  record_type: CrmRecordType;
}

/**
 * Facade over all CRM adapters (HubSpot, Salesforce, Pipedrive, Zoho, custom/generic API).
 * Authorization of *who* may request an action is done by the caller (call-engine); this class
 * verifies the connection (company, CRM category, ACTIVE) and the tool itself.
 */
@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adapters: CrmAdapterRegistry,
    private readonly status: IntegrationStatusService,
  ) {}

  /** CRM tools available for a connection: platform catalogue for its provider + tools defined on the connection. */
  async listToolsForIntegration(companyUuid: string, integrationUuid: string, includeInactive = false): Promise<CrmTool[]> {
    const integration = await this.loadCrm(companyUuid, integrationUuid, false);
    return this.prisma.crmTool.findMany({
      where: {
        OR: [
          { provider: integration.provider, company_uuid: null, integration_uuid: null, is_active: true },
          { integration_uuid: integration.id, company_uuid: companyUuid, ...(!includeInactive && { is_active: true }) },
        ],
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /** Finds a record in the CRM by phone / email / external id. Returns null when not found. */
  async lookupContact(
    companyUuid: string,
    integrationUuid: string,
    query: CrmLookupQuery,
  ): Promise<CrmRecord | null> {
    const integration = await this.loadCrm(companyUuid, integrationUuid);
    const adapter = this.adapters.get(integration.provider);
    return this.run(integration, () => adapter.lookupContact(integration, query));
  }

  async listFields(companyUuid: string, integrationUuid: string, recordType: CrmRecordType): Promise<CrmFieldInfo[]> {
    const integration = await this.loadCrm(companyUuid, integrationUuid);
    const adapter = this.adapters.get(integration.provider);
    return this.run(integration, () => adapter.listFields(integration, recordType));
  }

  /**
   * Executes a CRM tool / canonical action. `input._context` (added by call-engine) identifies the
   * call/contact the action concerns; it is consumed here and never forwarded to the CRM.
   */
  async executeTool(input: CrmExecuteToolInput): Promise<CrmExecuteToolResult> {
    const { _context, ...rawPayload } = (input.input ?? {}) as Record<string, any>;
    const context = (_context ?? {}) as CallContext;

    const integration = await this.loadCrm(input.company_uuid, input.integration_uuid);
    const adapter = this.adapters.get(integration.provider);

    return this.run(integration, async () => {
      switch (input.tool_key) {
        case CANONICAL_ACTION_KEYS.CRM_UPDATE_RECORD:
          return this.canonicalUpdate(integration, adapter, rawPayload, context);
        case CANONICAL_ACTION_KEYS.CRM_ADD_NOTE: {
          if (isBlank(rawPayload.note)) throw new BadRequestException('Missing required input: note');
          const ref = await this.resolveRef(integration, adapter, rawPayload, context);
          return { success: true, result: await adapter.addNote(integration, { ...ref, note: String(rawPayload.note) }) };
        }
        case CANONICAL_ACTION_KEYS.CRM_CREATE_TASK: {
          if (isBlank(rawPayload.title)) throw new BadRequestException('Missing required input: title');
          const ref = await this.resolveRef(integration, adapter, rawPayload, context);
          return {
            success: true,
            result: await adapter.createTask(integration, {
              ...ref,
              title: String(rawPayload.title),
              due_at: rawPayload.due_at,
              notes: rawPayload.notes,
            }),
          };
        }
        default:
          return this.executeCatalogueTool(integration, adapter, input.tool_key, rawPayload, context);
      }
    });
  }

  /**
   * Builds personalization dynamic variables for a call (spec §15). Never throws: when the CRM
   * is unreachable or has no record, every mapped key is still returned as "unknown".
   */
  async buildPersonalization(input: {
    company_uuid: string;
    agent_uuid: string;
    integration_uuid: string;
    contact: Pick<Contact, 'id' | 'external_id' | 'record_type' | 'phone' | 'email' | 'name'>;
  }): Promise<Record<string, string>> {
    const mappings = (await this.loadMappings(input.company_uuid, input.integration_uuid, input.agent_uuid)).filter(
      (m) => m.use_for_personalization,
    );

    const variables: Record<string, string> = {};
    for (const m of mappings) variables[personalizationVariableKey(m.internal_field)] = UNKNOWN;
    if (!mappings.length) return variables;

    try {
      const integration = await this.loadCrm(input.company_uuid, input.integration_uuid);
      const adapter = this.adapters.get(integration.provider);
      const contact = input.contact;

      const record = await this.run(integration, () =>
        adapter.lookupContact(
          integration,
          contact.external_id
            ? { external_id: contact.external_id, record_type: contact.record_type }
            : { phone: contact.phone ?? undefined, email: contact.email ?? undefined },
        ),
      );
      if (!record) return variables;

      const object = adapter.objectName(record.record_type);
      const readable = mappings.filter(
        (m) => m.direction !== MappingDirection.WRITE && (!m.external_object || m.external_object === object),
      );

      for (const m of readable) {
        const key = personalizationVariableKey(m.internal_field);
        if (variables[key] !== UNKNOWN) continue;

        let value = applyTransform(getPath(record.properties, m.external_field) ?? record.properties?.[m.external_field], m.transform);
        if (isBlank(value)) value = this.recordFallback(m.internal_field, record);
        const text = toStringValue(value).trim();
        if (text) variables[key] = text;
      }
    } catch (error) {
      this.logger.warn(`Personalization lookup failed: ${error?.message}`);
    }
    return variables;
  }

  /**
   * Post-call CRM update (spec §9, §13): writes outcome, summary, gathered data etc. through the
   * WRITE/BOTH field mappings and adds a note. Throws on failure so the action is retried.
   */
  async syncCallResult(input: CrmCallResultInput): Promise<CrmExecuteToolResult> {
    const integration = await this.loadCrm(input.company_uuid, input.integration_uuid);
    const adapter = this.adapters.get(integration.provider);

    const call = await this.prisma.call.findFirst({
      where: { id: input.call_uuid, company_uuid: input.company_uuid },
      include: { contact: true },
    });
    if (!call) throw new NotFoundException('Call not found');

    const contactUuid = input.contact_uuid ?? call.contact_uuid;
    const contact =
      contactUuid && contactUuid !== call.contact_uuid
        ? await this.prisma.contact.findFirst({ where: { id: contactUuid, company_uuid: input.company_uuid } })
        : call.contact;

    return this.run(integration, async () => {
      const ref = await this.resolveRecordForContact(integration, adapter, contact, call.to_number);
      if (!ref) throw new NotFoundException('No matching record was found in the CRM for this contact');

      const values = this.buildCallValues(call, contact);
      const mappings = await this.loadMappings(input.company_uuid, integration.id, input.agent_uuid);
      const { properties, applied } = this.mapForWrite(values, mappings, adapter, ref.record_type);

      let recordUpdated = false;
      if (Object.keys(properties).length) {
        await adapter.updateRecord(integration, { ...ref, properties });
        recordUpdated = true;
      }

      await adapter.addNote(integration, { ...ref, note: this.buildCallNote(call, values) });

      return {
        success: true,
        result: { record_updated: recordUpdated, note_created: true, updated_fields: applied },
      };
    });
  }

  // ------------------------------------------------------------------ internals

  private async loadCrm(companyUuid: string, integrationUuid: string, requireActive = true): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationUuid, company_uuid: companyUuid },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    if (integration.category !== IntegrationCategory.CRM) {
      throw new BadRequestException('This integration is not a CRM connection');
    }
    if (requireActive && integration.status !== IntegrationStatus.ACTIVE) {
      throw new BadRequestException('The CRM connection is not active');
    }
    return integration;
  }

  private async run<T>(integration: Integration, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof CrmHttpError) {
        if (error.isAuthError) {
          await this.status.markFailed(integration, 'The CRM rejected the stored credentials. Reconnect the integration.');
        }
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException(error instanceof Error ? error.message : 'CRM request failed');
    }
  }

  private async loadMappings(
    companyUuid: string,
    integrationUuid: string,
    agentUuid?: string | null,
  ): Promise<CrmFieldMapping[]> {
    const rows = await this.prisma.crmFieldMapping.findMany({
      where: {
        company_uuid: companyUuid,
        integration_uuid: integrationUuid,
        OR: agentUuid ? [{ agent_uuid: null }, { agent_uuid: agentUuid }] : [{ agent_uuid: null }],
      },
      orderBy: { created_at: 'asc' },
    });
    return dropOverridden(rows);
  }

  private mapForWrite(
    values: Record<string, unknown>,
    mappings: CrmFieldMapping[],
    adapter: CrmAdapter,
    recordType: CrmRecordType,
  ): { properties: Record<string, any>; applied: string[]; skipped: string[] } {
    const object = adapter.objectName(recordType);
    const writable = mappings.filter(
      (m) => m.direction !== MappingDirection.READ && (!m.external_object || m.external_object === object),
    );

    const properties: Record<string, any> = {};
    const applied: string[] = [];
    const skipped: string[] = [];

    for (const [internal, value] of Object.entries(values)) {
      const rows = writable.filter((m) => m.internal_field === internal);
      if (!rows.length) {
        skipped.push(internal);
        continue;
      }
      for (const row of rows) {
        const transformed = applyTransform(value, row.transform);
        if (isBlank(transformed)) continue;
        properties[row.external_field] = transformed;
        applied.push(internal);
      }
    }
    return { properties, applied: [...new Set(applied)], skipped };
  }

  private async canonicalUpdate(
    integration: Integration,
    adapter: CrmAdapter,
    payload: Record<string, any>,
    context: CallContext,
  ): Promise<CrmExecuteToolResult> {
    const fields = payload.fields;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      throw new BadRequestException('"fields" must be an object of platform field names and values');
    }

    const ref = await this.resolveRef(integration, adapter, payload, context);
    const agentUuid = payload.agent_uuid ?? (await this.agentOfCall(integration.company_uuid, context.call_uuid));
    const mappings = await this.loadMappings(integration.company_uuid, integration.id, agentUuid);
    const { properties, applied, skipped } = this.mapForWrite(fields, mappings, adapter, ref.record_type);

    if (!Object.keys(properties).length) {
      throw new BadRequestException(`No field mapping is configured for: ${Object.keys(fields).join(', ')}`);
    }

    await adapter.updateRecord(integration, { ...ref, properties });
    return { success: true, result: { updated_fields: applied, skipped_fields: skipped } };
  }

  private async executeCatalogueTool(
    integration: Integration,
    adapter: CrmAdapter,
    toolKey: string,
    rawPayload: Record<string, any>,
    context: CallContext,
  ): Promise<CrmExecuteToolResult> {
    const tool = await this.prisma.crmTool.findFirst({
      where: {
        key: toolKey,
        is_active: true,
        OR: [
          { provider: integration.provider, company_uuid: null, integration_uuid: null },
          { integration_uuid: integration.id, company_uuid: integration.company_uuid },
        ],
      },
      orderBy: { integration_uuid: { sort: 'desc', nulls: 'last' } },
    });
    if (!tool) throw new NotFoundException(`Tool "${toolKey}" is not available for this CRM connection`);

    const schema = (tool.input_schema ?? {}) as Record<string, any>;
    const payload = await this.prepareToolInput(integration, adapter, schema, rawPayload, context);
    return { success: true, result: await adapter.executeTool(integration, tool, payload) };
  }

  /** Fills the record id from the call context, keeps only declared properties, validates required/types. */
  private async prepareToolInput(
    integration: Integration,
    adapter: CrmAdapter,
    schema: Record<string, any>,
    rawPayload: Record<string, any>,
    context: CallContext,
  ): Promise<Record<string, any>> {
    const properties = (schema.properties ?? {}) as Record<string, { type?: string }>;
    const required: string[] = Array.isArray(schema.required) ? schema.required : [];
    const payload: Record<string, any> = { ...rawPayload };

    const idKey = ID_KEYS.find((k) => k in properties);
    if (idKey && isBlank(payload[idKey])) {
      const nothingIdentifying = ![...ID_KEYS, ...OTHER_IDENTIFIERS].some((k) => !isBlank(payload[k]));
      if (required.includes(idKey) || nothingIdentifying) {
        const ref = await this.tryResolveRef(integration, adapter, payload, context);
        if (ref) payload[idKey] = ref.external_id;
      }
    }

    const declared = Object.keys(properties);
    const cleaned = declared.length
      ? Object.fromEntries(Object.entries(payload).filter(([k]) => declared.includes(k)))
      : payload;

    const missing = required.filter((k) => isBlank(cleaned[k]));
    if (missing.length) throw new BadRequestException(`Missing required input: ${missing.join(', ')}`);

    for (const [key, def] of Object.entries(properties)) {
      const value = cleaned[key];
      if (isBlank(value) || !def?.type) continue;
      const ok =
        def.type === 'object'
          ? typeof value === 'object' && !Array.isArray(value)
          : def.type === 'number' || def.type === 'integer'
            ? typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)))
            : def.type === 'boolean'
              ? typeof value === 'boolean'
              : def.type === 'array'
                ? Array.isArray(value)
                : true;
      if (!ok) throw new BadRequestException(`Input "${key}" must be of type ${def.type}`);
      if (def.type === 'number' && typeof value === 'string') cleaned[key] = Number(value);
    }
    return cleaned;
  }

  private async tryResolveRef(
    integration: Integration,
    adapter: CrmAdapter,
    payload: Record<string, any>,
    context: CallContext,
  ): Promise<RecordRef | null> {
    try {
      return await this.resolveRef(integration, adapter, payload, context);
    } catch (error) {
      if (error instanceof BadRequestException) return null;
      throw error;
    }
  }

  /** Record identity: explicit payload, else the call's contact (stored id, else CRM lookup by phone/email). */
  private async resolveRef(
    integration: Integration,
    adapter: CrmAdapter,
    payload: Record<string, any>,
    context: CallContext,
  ): Promise<RecordRef> {
    const recordType = (payload.record_type as CrmRecordType) ?? undefined;

    if (!isBlank(payload.external_id)) {
      return {
        external_id: String(payload.external_id),
        record_type: recordType ?? context.contact?.record_type ?? adapter.defaultRecordType,
      };
    }

    const contact = await this.contactFromContext(integration.company_uuid, context);
    const ref = await this.resolveRecordForContact(integration, adapter, contact, null, recordType);
    if (!ref) throw new BadRequestException('Could not identify the CRM record this action applies to');
    return ref;
  }

  private async contactFromContext(companyUuid: string, context: CallContext): Promise<Contact | null> {
    const hint = context.contact;
    if (hint?.id) {
      const stored = await this.prisma.contact.findFirst({ where: { id: hint.id, company_uuid: companyUuid } });
      if (stored) return stored;
    }
    if (!hint) return null;
    return {
      external_id: hint.external_id ?? null,
      record_type: hint.record_type ?? CrmRecordType.CONTACT,
      phone: hint.phone ?? null,
      email: hint.email ?? null,
      name: hint.name ?? null,
    } as Contact;
  }

  private async resolveRecordForContact(
    integration: Integration,
    adapter: CrmAdapter,
    contact: Contact | null,
    fallbackPhone: string | null,
    recordType?: CrmRecordType,
  ): Promise<RecordRef | null> {
    if (contact?.external_id && (!contact.integration_uuid || contact.integration_uuid === integration.id)) {
      return { external_id: contact.external_id, record_type: recordType ?? contact.record_type };
    }

    const phone = contact?.phone ?? fallbackPhone ?? undefined;
    const email = contact?.email ?? undefined;
    if (!phone && !email) return null;

    const record = await adapter.lookupContact(integration, { phone, email, record_type: recordType });
    if (!record) return null;

    if (contact?.id) {
      await this.prisma.contact
        .update({
          where: { id: contact.id },
          data: {
            integration_uuid: integration.id,
            external_id: record.external_id,
            record_type: record.record_type,
            external_url: record.url ?? undefined,
          },
        })
        .catch((error) => this.logger.warn(`Could not link contact ${contact.id} to CRM record: ${error?.message}`));
    }
    return { external_id: record.external_id, record_type: record.record_type };
  }

  private async agentOfCall(companyUuid: string, callUuid?: string): Promise<string | undefined> {
    if (!callUuid) return undefined;
    const call = await this.prisma.call.findFirst({
      where: { id: callUuid, company_uuid: companyUuid },
      select: { agent_uuid: true },
    });
    return call?.agent_uuid;
  }

  private recordFallback(internalField: string, record: CrmRecord): unknown {
    switch (internalField) {
      case INTERNAL_CRM_FIELDS.CUSTOMER_NAME:
        return record.name;
      case INTERNAL_CRM_FIELDS.PHONE:
        return record.phone;
      case INTERNAL_CRM_FIELDS.EMAIL:
        return record.email;
      default:
        return undefined;
    }
  }

  private buildCallValues(
    call: {
      contact_name: string | null;
      to_number: string | null;
      outcome_label: string | null;
      outcome_key: string | null;
      summary: string | null;
      status: string;
      duration_seconds: number | null;
      started_at: Date | null;
      ended_at: Date | null;
      gathered_data: unknown;
    },
    contact: Contact | null,
  ): Record<string, unknown> {
    const gathered =
      call.gathered_data && typeof call.gathered_data === 'object' && !Array.isArray(call.gathered_data)
        ? (call.gathered_data as Record<string, unknown>)
        : {};

    const values: Record<string, unknown> = {
      [INTERNAL_CRM_FIELDS.CUSTOMER_NAME]: contact?.name ?? call.contact_name,
      [INTERNAL_CRM_FIELDS.PHONE]: contact?.phone ?? call.to_number,
      [INTERNAL_CRM_FIELDS.EMAIL]: contact?.email,
      [INTERNAL_CRM_FIELDS.CALL_OUTCOME]: call.outcome_label ?? call.outcome_key,
      [INTERNAL_CRM_FIELDS.CALL_SUMMARY]: call.summary,
      [INTERNAL_CRM_FIELDS.CALL_STATUS]: call.status,
      [INTERNAL_CRM_FIELDS.CALL_DURATION_SECONDS]: call.duration_seconds,
      [INTERNAL_CRM_FIELDS.CALL_DATE]: call.started_at?.toISOString(),
      [INTERNAL_CRM_FIELDS.INTEREST_LEVEL]: gathered.interest_level ?? gathered.interested,
      [INTERNAL_CRM_FIELDS.NEXT_FOLLOW_UP_DATE]: gathered.next_follow_up_date ?? gathered.preferred_date,
      [INTERNAL_CRM_FIELDS.LAST_CONTACT_DATE]: (call.ended_at ?? call.started_at)?.toISOString(),
      [INTERNAL_CRM_FIELDS.NOTES]: call.summary,
    };
    for (const [key, value] of Object.entries(gathered)) values[`${GOAL_FIELD_PREFIX}${key}`] = value;

    return Object.fromEntries(Object.entries(values).filter(([, v]) => !isBlank(v)));
  }

  private buildCallNote(
    call: { duration_seconds: number | null; outcome_label: string | null; outcome_key: string | null; summary: string | null },
    values: Record<string, unknown>,
  ): string {
    const lines = ['AI call summary'];
    const outcome = call.outcome_label ?? call.outcome_key;
    if (outcome) lines.push(`Outcome: ${outcome}`);
    if (call.duration_seconds != null) {
      lines.push(`Duration: ${Math.floor(call.duration_seconds / 60)}:${String(call.duration_seconds % 60).padStart(2, '0')}`);
    }
    if (call.summary) lines.push('', call.summary);

    const gathered = Object.entries(values).filter(([k]) => k.startsWith(GOAL_FIELD_PREFIX));
    if (gathered.length) {
      lines.push('', 'Information gathered:');
      for (const [key, value] of gathered) {
        lines.push(`- ${key.slice(GOAL_FIELD_PREFIX.length)}: ${toStringValue(value)}`);
      }
    }
    return lines.join('\n');
  }
}
