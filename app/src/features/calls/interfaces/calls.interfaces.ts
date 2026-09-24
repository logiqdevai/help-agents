import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const CallStatuses = {
  SCHEDULED: "SCHEDULED",
  QUEUED: "QUEUED",
  RINGING: "RINGING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  TRANSFERRED: "TRANSFERRED",
  NO_ANSWER: "NO_ANSWER",
  BUSY: "BUSY",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
} as const;
export type CallStatus = (typeof CallStatuses)[keyof typeof CallStatuses];

/** Statuses of a call that is being dialed or is on the line right now. */
export const LiveCallStatuses: CallStatus[] = [
  CallStatuses.QUEUED,
  CallStatuses.RINGING,
  CallStatuses.IN_PROGRESS,
];

export const ProcessingStatuses = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type ProcessingStatus = (typeof ProcessingStatuses)[keyof typeof ProcessingStatuses];

export const CallDirections = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
} as const;
export type CallDirection = (typeof CallDirections)[keyof typeof CallDirections];

export const CallDateRanges = {
  TODAY: "today",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  CUSTOM: "custom",
} as const;
export type CallDateRange = (typeof CallDateRanges)[keyof typeof CallDateRanges];

export const ActionStatuses = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXECUTED: "EXECUTED",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
  CANCELED: "CANCELED",
} as const;
export type ActionStatus = (typeof ActionStatuses)[keyof typeof ActionStatuses];

export const CostCategories = {
  AI: "AI",
  TELEPHONY: "TELEPHONY",
  OTHER: "OTHER",
} as const;
export type CostCategory = (typeof CostCategories)[keyof typeof CostCategories];

export const CostUnits = {
  SECOND: "SECOND",
  MINUTE: "MINUTE",
  CALL: "CALL",
  TOKEN: "TOKEN",
  MESSAGE: "MESSAGE",
} as const;
export type CostUnit = (typeof CostUnits)[keyof typeof CostUnits];

export const TranscriptRoles = {
  AGENT: "agent",
  CUSTOMER: "customer",
} as const;
export type TranscriptRole = (typeof TranscriptRoles)[keyof typeof TranscriptRoles];

export interface CallOutcome {
  key: string;
  label: string;
  is_successful: boolean | null;
}

export interface CallContactRef {
  id: string;
  name: string | null;
  integration: { id: string; name: string } | null;
}

export interface CallListItem {
  id: string;
  call_number: number;
  started_at: string | null;
  created_at: string;
  agent: { id: string; name: string };
  contact: CallContactRef | null;
  contact_name: string | null;
  from_number: string | null;
  to_number: string | null;
  direction: CallDirection;
  duration_seconds: number | null;
  status: CallStatus;
  outcome: CallOutcome | null;
  total_cost: number;
  currency: string;
  is_test: boolean;
  has_recording: boolean;
  has_pending_issues: boolean;
  failure_reason: string | null;
}

export interface TranscriptSegment {
  role: TranscriptRole;
  text: string;
  /** Seconds from the start of the call. */
  start?: number;
  end?: number;
}

export interface GatheredInformation {
  key: string;
  label: string;
  value: unknown;
}

export interface CrmAction {
  id: string;
  tool_key: string;
  kind: string;
  label: string;
  tool_name: string | null;
  integration_name: string | null;
  status: ActionStatus;
  executed_at: string | null;
  attempt_count: number;
  max_attempts: number;
  next_retry_at: string | null;
  error: string | null;
  can_retry: boolean;
}

export interface CostLineItem {
  category: CostCategory;
  description: string;
  quantity: number;
  unit: CostUnit;
  unit_price: number;
  amount: number;
  currency: string;
}

export interface CallCost {
  ai: number;
  telephony: number;
  total: number;
  currency: string;
  items: CostLineItem[];
}

export interface CallEvent {
  id: string;
  type: string;
  message: string | null;
  data: Record<string, unknown> | null;
  occurred_at: string;
}

export interface CallRecordingInfo {
  available: boolean;
  duration_seconds: number | null;
  expires_at: string | null;
}

export const CallWarningTypes = {
  CALL_FAILED: "CALL_FAILED",
  ANALYSIS_FAILED: "ANALYSIS_FAILED",
  CRM_UPDATE_FAILED: "CRM_UPDATE_FAILED",
  ACTION_FAILED: "ACTION_FAILED",
} as const;
export type CallWarningType = (typeof CallWarningTypes)[keyof typeof CallWarningTypes];

export interface CallWarning {
  type: CallWarningType;
  message: string;
  action_uuid?: string;
  can_retry?: boolean;
}

export interface CallDetailContact {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  external_url: string | null;
  record_type: string;
  integration: { id: string; name: string } | null;
}

export interface CallDetail extends Omit<CallListItem, "contact"> {
  contact: CallDetailContact | null;
  answered_at: string | null;
  ended_at: string | null;
  attempt_number: number;
  in_voicemail: boolean | null;
  transferred: boolean;
  transferred_to: string | null;
  transfer_reason: string | null;
  summary: string | null;
  transcript: TranscriptSegment[];
  transcript_text: string | null;
  information_gathered: GatheredInformation[];
  crm_actions: CrmAction[];
  cost: CallCost;
  activity_log: CallEvent[];
  recording: CallRecordingInfo;
  knowledge_used: { name: string; version: number | null }[];
  personalization: { key: string; label: string; value: string }[];
  agent_language: string | null;
  warnings: CallWarning[];
  error_message: string | null;
  analysis_status: ProcessingStatus;
}

export interface CallRecordingUrl {
  url: string;
  expires_at: string;
  duration_seconds: number | null;
}

export interface CallFilterOptions {
  agents: { id: string; name: string }[];
  outcomes: { key: string; label: string }[];
  integrations: { id: string; name: string }[];
  statuses: CallStatus[];
  directions: CallDirection[];
}

export interface CallsQuery extends PaginationQuery {
  agent_uuid?: string;
  from?: string;
  to?: string;
  outcome_key?: string;
  status?: CallStatus | "all";
  direction?: CallDirection | "all";
  contact_uuid?: string;
  integration_uuid?: string;
  search?: string;
  is_test?: "true" | "false" | "all";
}

export interface CallAgentOption {
  id: string;
  name: string;
}

/** Body of `POST /calls` and `POST /calls/test`. */
export interface PlaceCallDto {
  agent_uuid: string;
  contact_uuid?: string;
  phone?: string;
  name?: string;
}
