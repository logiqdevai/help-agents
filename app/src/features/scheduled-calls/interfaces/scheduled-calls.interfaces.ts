import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const ScheduledCallStatuses = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;
export type ScheduledCallStatus = (typeof ScheduledCallStatuses)[keyof typeof ScheduledCallStatuses];

export const ScheduledCallSources = {
  MANUAL: "MANUAL",
  RETRY: "RETRY",
  AUTOMATION: "AUTOMATION",
  FOLLOW_UP: "FOLLOW_UP",
} as const;
export type ScheduledCallSource = (typeof ScheduledCallSources)[keyof typeof ScheduledCallSources];

/** The three tabs of the scheduled calls page; each groups several API statuses. */
export const ScheduledCallTabs = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;
export type ScheduledCallTab = (typeof ScheduledCallTabs)[keyof typeof ScheduledCallTabs];

export const ScheduledCallTabStatuses: Record<ScheduledCallTab, ScheduledCallStatus[]> = {
  [ScheduledCallTabs.PENDING]: [ScheduledCallStatuses.PENDING, ScheduledCallStatuses.IN_PROGRESS],
  [ScheduledCallTabs.COMPLETED]: [ScheduledCallStatuses.COMPLETED, ScheduledCallStatuses.FAILED],
  [ScheduledCallTabs.CANCELED]: [ScheduledCallStatuses.CANCELED, ScheduledCallStatuses.SKIPPED],
};

export const ScheduleModes = {
  IMMEDIATELY: "immediately",
  AFTER_MINUTES: "after_minutes",
  TOMORROW: "tomorrow",
  DATE: "date",
} as const;
export type ScheduleMode = (typeof ScheduleModes)[keyof typeof ScheduleModes];

export interface ScheduledCall {
  id: string;
  agent_uuid: string;
  contact_uuid: string;
  source: ScheduledCallSource;
  status: ScheduledCallStatus;
  scheduled_for: string;
  attempt_number: number;
  max_attempts: number;
  closed_reason: string | null;
  created_at: string;
  agent: { id: string; name: string };
  contact: { id: string; name: string | null; phone: string | null };
  call: { id: string; call_number: number; status: string } | null;
}

export interface ScheduledCallCounts {
  pending: number;
  completed: number;
  canceled: number;
}

export interface ScheduledCallsQuery extends PaginationQuery {
  /** Comma separated statuses. */
  status?: string;
  source?: ScheduledCallSource | "all";
  agent_uuid?: string;
  contact_uuid?: string;
  search?: string;
  order_direction?: "asc" | "desc";
}

export interface ScheduleWhenDto {
  mode: ScheduleMode;
  minutes?: number;
  /** YYYY-MM-DD or ISO date-time, in the company timezone. */
  date?: string;
}

export interface CreateScheduledCallDto {
  agent_uuid: string;
  contact_uuid?: string;
  contact?: { name?: string; phone: string };
  when: ScheduleWhenDto;
}

export interface UpdateScheduledCallDto {
  when: ScheduleWhenDto;
}

export interface CallingHoursDay {
  /** 0 = Sunday ... 6 = Saturday. */
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

export interface CallingHours {
  timezone: string;
  days: CallingHoursDay[];
}
