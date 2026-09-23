import { ActionKind, Call, CallAction, Prisma } from 'generated/prisma';

export interface PlaceCallInput {
  company_uuid: string;
  agent_uuid: string;
  /** Existing Contact; otherwise pass `to_number` (+ optional `contact_name`). */
  contact_uuid?: string;
  to_number?: string;
  contact_name?: string;
  /** Link to the ScheduledCall that triggered this attempt. */
  scheduled_call_uuid?: string;
  attempt_number?: number;
  /** Test calls may use DRAFT/INACTIVE agents and ignore calling hours. */
  is_test?: boolean;
  requested_by_user_uuid?: string;
}

/** Weekly windows override, same shape as CompanyCallingHour rows (day_of_week 0 = Sunday). */
export interface CallingHoursOverride {
  timezone?: string;
  days: Array<{ day_of_week: number; start_time: string; end_time: string; is_enabled: boolean }>;
}

export type ActionSource = 'AGENT' | 'AUTOMATION' | 'SYSTEM' | 'USER';

export interface RequestActionInput {
  company_uuid: string;
  call_uuid: string;
  source: ActionSource;
  /** CrmTool.key or a canonical key from CANONICAL_ACTION_KEYS. */
  tool_key: string;
  kind?: ActionKind;
  payload?: Prisma.InputJsonValue;
  /** Defaults to the call's agent. */
  agent_uuid?: string | null;
  /** Defaults to the agent's CRM integration for kind CRM. */
  integration_uuid?: string | null;
  automation_action_uuid?: string | null;
  /** Delay execution until this time (automation `delay_minutes`). */
  run_at?: Date;
  /** Await execution and return the finished action (used for live agent tool calls). */
  wait?: boolean;
}

/** Non-CRM action executors (email, SMS, calendar, webhook...) register themselves on CallActionsService. */
export interface CallActionHandler {
  kind: ActionKind;
  /** Returns the JSON result to store on the action; throws to signal failure (retried with backoff). */
  execute(action: CallAction, call: Call): Promise<Prisma.InputJsonValue>;
}

/** Short, AI-readable answer to a live tool invocation. */
export interface VoiceToolResponse {
  success: boolean;
  result?: unknown;
  error?: string;
}
