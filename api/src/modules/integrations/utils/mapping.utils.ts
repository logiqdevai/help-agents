import { CrmFieldMapping } from 'generated/prisma';
import { toStringValue } from './template.utils';

export interface FieldTransform {
  format?: 'date' | 'datetime' | 'number' | 'boolean' | 'uppercase' | 'lowercase';
  map?: Record<string, unknown>;
  default?: unknown;
  prefix?: string;
  suffix?: string;
}

/** Applies a mapping's optional `transform` (value formatting, lookup map, default, prefix/suffix). */
export function applyTransform(value: unknown, transform: unknown): unknown {
  if (!transform || typeof transform !== 'object' || Array.isArray(transform)) return value;
  const t = transform as FieldTransform;

  let result: unknown = value;
  if ((result === undefined || result === null || result === '') && t.default !== undefined) result = t.default;
  if (result === undefined || result === null || result === '') return result;

  if (t.map && typeof result !== 'object') {
    const mapped = t.map[String(result)];
    if (mapped !== undefined) result = mapped;
  }

  switch (t.format) {
    case 'date': {
      const d = new Date(String(result));
      if (!Number.isNaN(d.getTime())) result = d.toISOString().slice(0, 10);
      break;
    }
    case 'datetime': {
      const d = new Date(String(result));
      if (!Number.isNaN(d.getTime())) result = d.toISOString();
      break;
    }
    case 'number':
      if (!Number.isNaN(Number(result))) result = Number(result);
      break;
    case 'boolean':
      result = ['true', 'yes', '1', 'y'].includes(String(result).toLowerCase());
      break;
    case 'uppercase':
      result = String(result).toUpperCase();
      break;
    case 'lowercase':
      result = String(result).toLowerCase();
      break;
  }

  if ((t.prefix || t.suffix) && typeof result !== 'object') {
    result = `${t.prefix ?? ''}${toStringValue(result)}${t.suffix ?? ''}`;
  }
  return result;
}

/** Agent-specific mappings replace the connection-level ones for the same internal field. */
export function dropOverridden(rows: CrmFieldMapping[]): CrmFieldMapping[] {
  const agentFields = new Set(rows.filter((r) => r.agent_uuid).map((r) => r.internal_field));
  return rows.filter((r) => r.agent_uuid || !agentFields.has(r.internal_field));
}

export function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
