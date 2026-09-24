import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const AutomationTriggers = {
  CALL_OUTCOME: "CALL_OUTCOME",
  CALL_COMPLETED: "CALL_COMPLETED",
  CALL_FAILED: "CALL_FAILED",
  CALL_TRANSFERRED: "CALL_TRANSFERRED",
  VOICEMAIL_DETECTED: "VOICEMAIL_DETECTED",
} as const;
export type AutomationTrigger = (typeof AutomationTriggers)[keyof typeof AutomationTriggers];

export const AutomationActionTypes = {
  UPDATE_CRM: "UPDATE_CRM",
  ADD_CRM_NOTE: "ADD_CRM_NOTE",
  CREATE_CRM_TASK: "CREATE_CRM_TASK",
  SCHEDULE_FOLLOW_UP: "SCHEDULE_FOLLOW_UP",
  CANCEL_FOLLOW_UPS: "CANCEL_FOLLOW_UPS",
  CREATE_CALENDAR_EVENT: "CREATE_CALENDAR_EVENT",
  SEND_EMAIL: "SEND_EMAIL",
  SEND_SMS: "SEND_SMS",
  WEBHOOK: "WEBHOOK",
} as const;
export type AutomationActionType = (typeof AutomationActionTypes)[keyof typeof AutomationActionTypes];

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  config: Record<string, unknown> | null;
  delay_minutes: number;
  position: number;
}

/** "When <trigger> [outcome] then <actions>". `agent_uuid` null means the rule applies to every agent. */
export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  agent_uuid: string | null;
  outcome_uuid: string | null;
  conditions: Record<string, unknown> | null;
  is_enabled: boolean;
  position: number;
  actions: AutomationAction[];
  created_at: string;
  updated_at: string;
}

export interface AutomationRulesQuery extends PaginationQuery {
  trigger?: AutomationTrigger;
  agent_uuid?: string;
  /** With `agent_uuid`: also return the rules that apply to every agent. */
  include_company_wide?: boolean;
  is_enabled?: boolean;
}

/** What a webhook action sends along; each key is a section of the call data. */
export const WebhookIncludeKeys = {
  CALL: "call",
  CONTACT: "contact",
  GATHERED: "gathered",
  SUMMARY: "summary",
  TRANSCRIPT: "transcript",
} as const;
export type WebhookIncludeKey = (typeof WebhookIncludeKeys)[keyof typeof WebhookIncludeKeys];

/** Who an automation rule applies to. */
export const RuleScopes = {
  AGENT: "agent",
  COMPANY: "company",
} as const;
export type RuleScope = (typeof RuleScopes)[keyof typeof RuleScopes];

export const DelayUnits = {
  MINUTES: "minutes",
  HOURS: "hours",
  DAYS: "days",
} as const;
export type DelayUnit = (typeof DelayUnits)[keyof typeof DelayUnits];

export const MinutesPerDelayUnit: Record<DelayUnit, number> = {
  [DelayUnits.MINUTES]: 1,
  [DelayUnits.HOURS]: 60,
  [DelayUnits.DAYS]: 1440,
};

/** Who an automatic email or text message goes to. */
export const RecipientModes = {
  CONTACT: "contact",
  CUSTOM: "custom",
} as const;
export type RecipientMode = (typeof RecipientModes)[keyof typeof RecipientModes];

export interface AutomationActionInput {
  type: AutomationActionType;
  /** Type-specific settings; texts may use placeholders such as {{call.summary}}. */
  config: Record<string, unknown>;
  delay_minutes: number;
}

export interface CreateAutomationRuleDto {
  name: string;
  trigger: AutomationTrigger;
  /** `null` = every agent of the company. */
  agent_uuid: string | null;
  /** Only with the CALL_OUTCOME trigger and an agent; `null` = any outcome. */
  outcome_uuid: string | null;
  is_enabled?: boolean;
  actions: AutomationActionInput[];
}

export type UpdateAutomationRuleDto = Partial<CreateAutomationRuleDto>;
