import { BadRequestException } from '@nestjs/common';
import { CrmRecordType, CrmTool, Integration } from 'generated/prisma';
import { CrmLookupQuery, CrmRecord } from '../interfaces/crm.interface';

export interface CrmFieldInfo {
  name: string;
  label: string;
  type?: string;
}

export interface CrmUpdateParams {
  external_id: string;
  record_type: CrmRecordType;
  /** Keyed by the CRM's own field names. */
  properties: Record<string, any>;
}

export interface CrmNoteParams {
  external_id: string;
  record_type: CrmRecordType;
  note: string;
}

export interface CrmTaskParams {
  external_id: string;
  record_type: CrmRecordType;
  title: string;
  due_at?: string;
  notes?: string;
}

export interface CrmAdapter {
  readonly defaultRecordType: CrmRecordType;
  /** CRM object name of a record type (e.g. "contacts", "Lead"); used to filter field mappings. */
  objectName(recordType: CrmRecordType): string;
  /** Throws when the connection is unusable. */
  testConnection(integration: Integration): Promise<void>;
  lookupContact(integration: Integration, query: CrmLookupQuery): Promise<CrmRecord | null>;
  updateRecord(integration: Integration, params: CrmUpdateParams): Promise<unknown>;
  addNote(integration: Integration, params: CrmNoteParams): Promise<unknown>;
  createTask(integration: Integration, params: CrmTaskParams): Promise<unknown>;
  listFields(integration: Integration, recordType: CrmRecordType): Promise<CrmFieldInfo[]>;
  /** Executes one of the connected CRM's catalogue tools with AI-supplied input. */
  executeTool(integration: Integration, tool: CrmTool, input: Record<string, any>): Promise<unknown>;
}

export function requireInput(input: Record<string, any>, ...keys: string[]): void {
  const missing = keys.filter((k) => input?.[k] === undefined || input[k] === null || input[k] === '');
  if (missing.length) throw new BadRequestException(`Missing required input: ${missing.join(', ')}`);
}

export function asProperties(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('"properties" must be an object');
  }
  return value as Record<string, any>;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function isoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
