import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const AlertStatuses = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type AlertStatus = (typeof AlertStatuses)[keyof typeof AlertStatuses];

export const AlertSeverities = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;
export type AlertSeverity = (typeof AlertSeverities)[keyof typeof AlertSeverities];

export const AlertTypes = {
  INTEGRATION_FAILED: "INTEGRATION_FAILED",
  AI_SERVICE_UNAVAILABLE: "AI_SERVICE_UNAVAILABLE",
  CALL_FAILED: "CALL_FAILED",
  KNOWLEDGE_PROCESSING_FAILED: "KNOWLEDGE_PROCESSING_FAILED",
  CRM_UPDATE_FAILED: "CRM_UPDATE_FAILED",
  INVALID_PHONE_NUMBER: "INVALID_PHONE_NUMBER",
  NO_PHONE_NUMBER_AVAILABLE: "NO_PHONE_NUMBER_AVAILABLE",
  OTHER: "OTHER",
} as const;
export type AlertType = (typeof AlertTypes)[keyof typeof AlertTypes];

/** Kinds of records an alert can point at (`entity_type` on the API). */
export const AlertEntityTypes = {
  AGENT: "agent",
  CALL: "call",
  CALL_ACTION: "call_action",
  COMPANY: "company",
  CONTACT: "contact",
  INTEGRATION: "integration",
  KNOWLEDGE_SOURCE: "knowledge_source",
  SCHEDULED_CALL: "scheduled_call",
} as const;
export type AlertEntityType = (typeof AlertEntityTypes)[keyof typeof AlertEntityTypes];

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string | null;
  entity_type: string | null;
  entity_uuid: string | null;
  metadata: { call_uuid?: string; tool_key?: string } | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertsSummary {
  open_total: number;
  by_status: { open: number; resolved: number; dismissed: number };
  by_type: { type: AlertType; count: number }[];
  by_severity: { severity: AlertSeverity; count: number }[];
}

export interface AlertsQuery extends PaginationQuery {
  status?: AlertStatus | "ALL";
  type?: AlertType | "all";
  severity?: AlertSeverity | "all";
}

export interface DismissAllAlertsDto {
  type?: AlertType;
}

export interface DismissAllAlertsResult {
  dismissed: number;
}

export interface RetryCrmUpdateDto {
  callId: string;
  actionId: string;
}
