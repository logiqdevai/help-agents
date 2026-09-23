import { BadRequestException } from '@nestjs/common';
import { AutomationActionType } from 'generated/prisma';
import { isValidPhone } from '@/shared/utils/phone/phone.utils';
import { validatePublicHttpsUrl } from './ssrf.utils';

type Config = Record<string, any>;

export const WEBHOOK_INCLUDE_KEYS = ['call', 'contact', 'gathered', 'summary', 'transcript'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 5000;
const FORBIDDEN_HEADERS = new Set(['host', 'content-length', 'transfer-encoding', 'connection']);

function fail(type: AutomationActionType, message: string): never {
  throw new BadRequestException(`Invalid ${type} action: ${message}`);
}

function text(type: AutomationActionType, cfg: Config, key: string, required = true, max = MAX_TEXT): string | undefined {
  const value = cfg[key];
  if (value === undefined || value === null || value === '') {
    if (required) fail(type, `\`${key}\` is required`);
    return undefined;
  }
  if (typeof value !== 'string') fail(type, `\`${key}\` must be a string`);
  if (value.length > max) fail(type, `\`${key}\` is too long`);
  return value;
}

function num(type: AutomationActionType, cfg: Config, key: string, min: number, max: number): number | undefined {
  const value = cfg[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    fail(type, `\`${key}\` must be a number between ${min} and ${max}`);
  }
  return value;
}

const hasTemplate = (v: string) => v.includes('{{');

/** Validates and normalises an action's config; returns the stored shape. */
export function validateActionConfig(type: AutomationActionType, raw: unknown): Config {
  if (raw !== undefined && raw !== null && (typeof raw !== 'object' || Array.isArray(raw))) {
    fail(type, 'config must be an object');
  }
  const cfg: Config = (raw as Config) ?? {};

  switch (type) {
    case AutomationActionType.UPDATE_CRM: {
      const fields = cfg.fields;
      if (fields === undefined || fields === null) return {};
      if (typeof fields !== 'object' || Array.isArray(fields)) fail(type, '`fields` must be an object');
      const entries = Object.entries(fields as Config);
      if (entries.length > 50) fail(type, 'too many fields');
      for (const [k, v] of entries) {
        if (!k || k.length > 100) fail(type, 'invalid field name');
        if (!(v === null || ['string', 'number', 'boolean'].includes(typeof v))) {
          fail(type, `field "${k}" must be a string, number, boolean or null`);
        }
      }
      return { fields };
    }

    case AutomationActionType.ADD_CRM_NOTE:
      return { note: text(type, cfg, 'note') };

    case AutomationActionType.CREATE_CRM_TASK:
      return {
        title: text(type, cfg, 'title', true, 300),
        due_in_days: num(type, cfg, 'due_in_days', 0, 365),
        notes: text(type, cfg, 'notes', false),
      };

    case AutomationActionType.SCHEDULE_FOLLOW_UP: {
      const delay_minutes = num(type, cfg, 'delay_minutes', 0, 525600);
      const delay_days = num(type, cfg, 'delay_days', 0, 365);
      if (delay_minutes === undefined && delay_days === undefined) {
        fail(type, '`delay_minutes` or `delay_days` is required');
      }
      const agent_uuid = text(type, cfg, 'agent_uuid', false, 36);
      return { agent_uuid, delay_minutes, delay_days, reason: text(type, cfg, 'reason', false, 500) };
    }

    case AutomationActionType.CANCEL_FOLLOW_UPS:
      return {};

    case AutomationActionType.CREATE_CALENDAR_EVENT: {
      const start_from = text(type, cfg, 'start_from', true, 200);
      const attendee = text(type, cfg, 'attendee_email', false, 320);
      if (attendee && !hasTemplate(attendee) && !EMAIL_RE.test(attendee)) fail(type, 'invalid attendee_email');
      return {
        title: text(type, cfg, 'title', true, 300),
        duration_minutes: num(type, cfg, 'duration_minutes', 5, 1440) ?? fail(type, '`duration_minutes` is required'),
        start_from,
        attendee_email: attendee,
      };
    }

    case AutomationActionType.SEND_EMAIL: {
      const to = text(type, cfg, 'to', true, 320)!;
      if (to !== 'contact' && !hasTemplate(to) && !EMAIL_RE.test(to)) fail(type, '`to` must be "contact" or an email');
      return { to, subject: text(type, cfg, 'subject', true, 300), body: text(type, cfg, 'body') };
    }

    case AutomationActionType.SEND_SMS: {
      const to = text(type, cfg, 'to', true, 32)!;
      if (to !== 'contact' && !hasTemplate(to) && !isValidPhone(to)) fail(type, '`to` must be "contact" or an E.164 number');
      return { to, body: text(type, cfg, 'body', true, 1600) };
    }

    case AutomationActionType.WEBHOOK: {
      const url = text(type, cfg, 'url', true, 2000)!;
      const problem = validatePublicHttpsUrl(url);
      if (problem) fail(type, problem);

      let headers: Record<string, string> | undefined;
      if (cfg.headers !== undefined && cfg.headers !== null) {
        if (typeof cfg.headers !== 'object' || Array.isArray(cfg.headers)) fail(type, '`headers` must be an object');
        const entries = Object.entries(cfg.headers as Config);
        if (entries.length > 10) fail(type, 'too many headers');
        for (const [k, v] of entries) {
          if (typeof v !== 'string' || v.length > 1000 || !/^[A-Za-z0-9-]+$/.test(k) || FORBIDDEN_HEADERS.has(k.toLowerCase())) {
            fail(type, `invalid header "${k}"`);
          }
        }
        headers = cfg.headers;
      }

      let include: string[] | undefined;
      if (cfg.include !== undefined && cfg.include !== null) {
        if (!Array.isArray(cfg.include) || cfg.include.some((i) => !(WEBHOOK_INCLUDE_KEYS as readonly string[]).includes(i))) {
          fail(type, `\`include\` must be a subset of ${WEBHOOK_INCLUDE_KEYS.join(', ')}`);
        }
        include = cfg.include;
      }
      return { url, headers, include };
    }

    default:
      return fail(type, 'unsupported action type');
  }
}

export interface ConditionsShape {
  is_successful?: boolean;
  direction?: string | string[];
  attempt_number_gte?: number;
  outcome_key?: string | string[];
}

const CONDITION_KEYS = new Set(['is_successful', 'direction', 'attempt_number_gte', 'outcome_key']);

export function validateConditions(raw: unknown): ConditionsShape | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new BadRequestException('conditions must be an object');

  const cond = raw as Record<string, any>;
  for (const key of Object.keys(cond)) {
    if (!CONDITION_KEYS.has(key)) throw new BadRequestException(`Unknown condition "${key}"`);
  }
  if (cond.is_successful !== undefined && typeof cond.is_successful !== 'boolean') {
    throw new BadRequestException('conditions.is_successful must be a boolean');
  }
  if (cond.attempt_number_gte !== undefined && !Number.isInteger(cond.attempt_number_gte)) {
    throw new BadRequestException('conditions.attempt_number_gte must be an integer');
  }
  for (const key of ['direction', 'outcome_key'] as const) {
    const v = cond[key];
    if (v === undefined) continue;
    const ok = typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'));
    if (!ok) throw new BadRequestException(`conditions.${key} must be a string or array of strings`);
  }
  if (cond.direction !== undefined) {
    const dirs = ([] as string[]).concat(cond.direction);
    if (dirs.some((d) => d !== 'INBOUND' && d !== 'OUTBOUND')) {
      throw new BadRequestException('conditions.direction must be INBOUND or OUTBOUND');
    }
  }
  return Object.keys(cond).length ? (cond as ConditionsShape) : null;
}

export function matchesConditions(
  conditions: unknown,
  call: { is_successful: boolean | null; direction: string; attempt_number: number; outcome_key: string | null },
): boolean {
  if (!conditions || typeof conditions !== 'object') return true;
  const c = conditions as ConditionsShape;

  if (c.is_successful !== undefined && call.is_successful !== c.is_successful) return false;
  if (c.direction !== undefined && !([] as string[]).concat(c.direction).includes(call.direction)) return false;
  if (c.attempt_number_gte !== undefined && call.attempt_number < c.attempt_number_gte) return false;
  if (c.outcome_key !== undefined && !([] as string[]).concat(c.outcome_key).includes(call.outcome_key ?? '')) return false;
  return true;
}
