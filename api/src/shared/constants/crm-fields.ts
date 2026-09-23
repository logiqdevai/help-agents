/**
 * Platform-side ("our") field names used by CRM field mappings (spec §13).
 * `CrmFieldMapping.internal_field` holds one of these, or `goal.<goal_item_key>`
 * for values collected against an agent's goal items.
 */
export const INTERNAL_CRM_FIELDS = {
  CUSTOMER_NAME: 'customer_name',
  PHONE: 'phone',
  EMAIL: 'email',
  CALL_OUTCOME: 'call_outcome',
  CALL_SUMMARY: 'call_summary',
  CALL_STATUS: 'call_status',
  CALL_DURATION_SECONDS: 'call_duration_seconds',
  CALL_DATE: 'call_date',
  INTEREST_LEVEL: 'interest_level',
  NEXT_FOLLOW_UP_DATE: 'next_follow_up_date',
  LAST_CONTACT_DATE: 'last_contact_date',
  NOTES: 'notes',
} as const;

export type InternalCrmField = (typeof INTERNAL_CRM_FIELDS)[keyof typeof INTERNAL_CRM_FIELDS];

export const GOAL_FIELD_PREFIX = 'goal.';

/** Canonical keys for provider-neutral actions (automation rules, post-call sync). */
export const CANONICAL_ACTION_KEYS = {
  CRM_SYNC_CALL_RESULT: 'crm.sync_call_result',
  CRM_UPDATE_RECORD: 'crm.update_record',
  CRM_ADD_NOTE: 'crm.add_note',
  CRM_CREATE_TASK: 'crm.create_task',
  EMAIL_SEND: 'email.send',
  SMS_SEND: 'sms.send',
  CALENDAR_CREATE_EVENT: 'calendar.create_event',
  WEBHOOK_POST: 'webhook.post',
} as const;

/** Dynamic-variable name for a mapped internal field: "goal.budget" -> "goal_budget". */
export function personalizationVariableKey(internalField: string): string {
  return internalField.replace(/[^a-zA-Z0-9_]/g, '_');
}

/** Variables every call receives regardless of CRM mappings. */
export const BASE_PERSONALIZATION_VARIABLES = ['customer_name', 'company_name', 'agent_name'] as const;
