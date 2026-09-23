import { BadRequestException } from '@nestjs/common';
import { CallStatus, OutcomeSystemType, Prisma, IntegrationProvider } from 'generated/prisma';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { AgentReadiness, ReadinessBlocker } from '../interfaces/agent.interface';

export const FINAL_CALL_STATUSES: CallStatus[] = [
  CallStatus.COMPLETED,
  CallStatus.TRANSFERRED,
  CallStatus.NO_ANSWER,
  CallStatus.BUSY,
  CallStatus.FAILED,
];

export const DEFAULT_OUTCOMES: Array<{
  key: string;
  label: string;
  description: string;
  is_success: boolean;
  system_type?: OutcomeSystemType;
}> = [
  { key: 'interested', label: 'Interested', description: 'The contact is interested and wants to continue.', is_success: true },
  { key: 'not_interested', label: 'Not Interested', description: 'The contact is not interested.', is_success: false },
  { key: 'call_back_later', label: 'Call Back Later', description: 'The contact asked to be called again later.', is_success: false },
  { key: 'appointment_requested', label: 'Appointment Requested', description: 'The contact asked to book an appointment.', is_success: true },
  { key: 'voicemail', label: 'Voicemail', description: 'The call reached an answering machine.', is_success: false, system_type: OutcomeSystemType.VOICEMAIL },
  { key: 'wrong_number', label: 'Wrong Number', description: 'The number does not belong to the intended contact.', is_success: false, system_type: OutcomeSystemType.WRONG_NUMBER },
  { key: 'no_answer', label: 'No Answer', description: 'Nobody picked up the call.', is_success: false, system_type: OutcomeSystemType.NO_ANSWER },
  { key: 'unknown', label: 'Unknown', description: 'The outcome could not be determined.', is_success: false, system_type: OutcomeSystemType.UNKNOWN },
];

export const REQUIRED_SYSTEM_TYPES: OutcomeSystemType[] = [
  OutcomeSystemType.VOICEMAIL,
  OutcomeSystemType.NO_ANSWER,
  OutcomeSystemType.WRONG_NUMBER,
  OutcomeSystemType.UNKNOWN,
];

export function slugifyKey(label: string): string {
  let key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  if (!key) key = 'item';
  if (/^[0-9]/.test(key)) key = `f_${key}`;
  return key;
}

export interface KeyedPlanEntry<I, R> {
  item: I;
  row?: R;
  key: string;
  position: number;
}

/**
 * Matches payload items to existing rows (by id, else by key) and assigns unique keys.
 * Returns the ordered plan plus ids of existing rows that are not in the payload.
 */
export function planKeyedReplace<
  I extends { id?: string; key?: string; label: string },
  R extends { id: string; key: string },
>(items: I[], existing: R[]): { plan: KeyedPlanEntry<I, R>[]; deleteIds: string[] } {
  const byId = new Map(existing.map((r) => [r.id, r]));
  const byKey = new Map(existing.map((r) => [r.key, r]));
  const matchedIds = new Set<string>();
  const reserved = new Set<string>();

  const matched = items.map((item) => {
    let row: R | undefined;
    if (item.id) {
      row = byId.get(item.id);
      if (!row) throw new BadRequestException(`Unknown id "${item.id}"`);
    } else if (item.key) {
      row = byKey.get(item.key);
    }
    if (row) {
      if (matchedIds.has(row.id)) throw new BadRequestException('Duplicate entry in payload');
      matchedIds.add(row.id);
    }
    const explicit = item.key ?? row?.key;
    if (explicit) {
      if (reserved.has(explicit)) throw new BadRequestException(`Duplicate key "${explicit}"`);
      reserved.add(explicit);
    }
    return { item, row, explicit };
  });

  const plan = matched.map(({ item, row, explicit }, position) => {
    let key = explicit;
    if (!key) {
      const base = slugifyKey(item.label);
      key = base;
      for (let n = 2; reserved.has(key); n++) key = `${base}_${n}`;
      reserved.add(key);
    }
    return { item, row, key, position };
  });

  const deleteIds = existing.filter((r) => !matchedIds.has(r.id)).map((r) => r.id);
  return { plan, deleteIds };
}

export function catalogueWhere(integration: {
  id: string;
  provider: IntegrationProvider;
}): Prisma.CrmToolWhereInput {
  return {
    is_active: true,
    OR: [
      { company_uuid: null, integration_uuid: null, provider: integration.provider },
      { integration_uuid: integration.id },
    ],
  };
}

export function normalizeTransferNumber(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const e164 = toE164(value);
  if (!e164) throw new BadRequestException('transfer_number must be a valid phone number');
  return e164;
}

export interface ReadinessInput {
  agent: {
    name: string;
    instructions: string;
    language: string | null;
    transfer_enabled: boolean;
    transfer_number: string | null;
    status: string;
    crm_integration: { status: string } | null;
  };
  outcomes_count: number;
  active_phone_numbers: number;
  knowledge_sources: number;
  test_calls: number;
}

export function computeReadiness(input: ReadinessInput): AgentReadiness {
  const { agent } = input;
  const blockers: ReadinessBlocker[] = [];

  if (!agent.name?.trim()) blockers.push({ code: 'NAME_MISSING', message: 'The agent needs a name.' });
  if (!agent.instructions?.trim()) {
    blockers.push({ code: 'INSTRUCTIONS_MISSING', message: 'Describe how the agent should behave in the instructions.' });
  }
  if (input.outcomes_count < 1) {
    blockers.push({ code: 'NO_OUTCOMES', message: 'Define at least one call outcome.' });
  }
  if (!agent.language?.trim()) blockers.push({ code: 'LANGUAGE_MISSING', message: 'Choose a language.' });
  if (agent.transfer_enabled && !(agent.transfer_number && toE164(agent.transfer_number))) {
    blockers.push({ code: 'TRANSFER_NUMBER_INVALID', message: 'Set a valid number to transfer calls to.' });
  }
  if (input.active_phone_numbers < 1) {
    blockers.push({ code: 'NO_PHONE_NUMBER', message: 'Assign an active phone number to the agent.' });
  }

  const warnings: string[] = [];
  if (agent.crm_integration && agent.crm_integration.status !== 'ACTIVE') {
    warnings.push('The connected CRM is not active; CRM updates may fail.');
  }

  return {
    is_ready: blockers.length === 0,
    blockers,
    warnings,
    steps: {
      basics: { complete: !!agent.name?.trim() },
      behavior: { complete: !!agent.instructions?.trim() && input.outcomes_count > 0 },
      knowledge: { complete: input.knowledge_sources > 0, optional: true },
      crm: { complete: !!agent.crm_integration, optional: true },
      phone: { complete: input.active_phone_numbers > 0 },
      test: { complete: input.test_calls > 0, optional: true },
      activate: { complete: agent.status === 'ACTIVE' },
    },
  };
}
