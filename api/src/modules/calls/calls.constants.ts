import { ActionStatus, CallStatus } from 'generated/prisma';

export const FINAL_CALL_STATUSES: CallStatus[] = [
  CallStatus.COMPLETED,
  CallStatus.TRANSFERRED,
  CallStatus.NO_ANSWER,
  CallStatus.BUSY,
  CallStatus.FAILED,
  CallStatus.CANCELED,
];

export const LIVE_CALL_STATUSES: CallStatus[] = [
  CallStatus.QUEUED,
  CallStatus.RINGING,
  CallStatus.IN_PROGRESS,
];

export const PRE_ANSWER_CALL_STATUSES: CallStatus[] = [
  CallStatus.SCHEDULED,
  CallStatus.QUEUED,
  CallStatus.RINGING,
];

export const ISSUE_ACTION_STATUSES: ActionStatus[] = [
  ActionStatus.FAILED,
  ActionStatus.NEEDS_ATTENTION,
  ActionStatus.RETRYING,
];

export const RETRYABLE_ACTION_STATUSES: ActionStatus[] = [
  ActionStatus.FAILED,
  ActionStatus.NEEDS_ATTENTION,
];

export const MAX_EVENT_ATTEMPTS = 5;
export const EVENT_SWEEP_MIN_AGE_MS = 60 * 1000;
export const STUCK_CALL_AGE_MS = 2 * 60 * 60 * 1000;
export const STUCK_ANALYSIS_AGE_MS = 10 * 60 * 1000;
export const RECORDING_DOWNLOAD_TIMEOUT_MS = 30_000;
export const RECORDING_MAX_BYTES = 200 * 1024 * 1024;
export const RECORDING_URL_TTL_MINUTES = 15;
export const INBOUND_CRM_TIMEOUT_MS = 3000;

/** CallEvent types used as at-most-once markers for downstream steps. */
export const CallMarkers = {
  FINISH_HANDLED: 'finish.handled',
  OUTCOME_AUTOMATION: 'automation.outcome',
} as const;

export const ACTION_LABELS: Record<string, string> = {
  'crm.sync_call_result': 'CRM record updated',
  'crm.update_record': 'CRM record updated',
  'crm.add_note': 'Note created',
  'crm.create_task': 'Follow-up task created',
  'email.send': 'Email sent',
  'sms.send': 'SMS sent',
  'calendar.create_event': 'Calendar event created',
  'webhook.post': 'Webhook sent',
};
