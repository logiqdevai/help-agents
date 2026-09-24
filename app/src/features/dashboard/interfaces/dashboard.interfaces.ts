import type { CallDirection, CallStatus } from "@/features/calls/interfaces/calls.interfaces";
import type { ScheduledCallSource } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import type {
  AgentStatus,
  OutcomeCount,
  PeriodInfo,
  TimeBucket,
  TimeseriesPoint,
  UsagePeriod,
} from "@/features/analytics/interfaces/analytics.interfaces";

export const DashboardPeriods = {
  TODAY: "today",
  LAST_7_DAYS: "7d",
  LAST_30_DAYS: "30d",
} as const satisfies Record<string, UsagePeriod>;
export type DashboardPeriod = (typeof DashboardPeriods)[keyof typeof DashboardPeriods];

export const AttentionReasonTypes = {
  CALL_FAILED: "call_failed",
  CRM_UPDATE_FAILED: "crm_update_failed",
} as const;
export type AttentionReasonType = (typeof AttentionReasonTypes)[keyof typeof AttentionReasonTypes];

export interface DashboardQuery {
  period: DashboardPeriod;
}

export interface AgentRef {
  id: string;
  name: string;
}

export interface DashboardComparison {
  total_calls: number;
  successful_calls: number;
  interested_leads: number;
  appointments_booked: number;
  average_call_duration_seconds: number;
  total_cost: number;
}

export interface DashboardSummary {
  total_calls: number;
  calls_today: number;
  successful_calls: number;
  success_rate: number;
  interested_leads: number;
  appointments_booked: number;
  average_call_duration_seconds: number;
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  currency: string;
  previous: DashboardComparison;
}

export interface MonthToDateCost {
  total_cost: number;
  projected_total_cost: number;
  days_elapsed: number;
  days_in_month: number;
  month_end: string;
}

export interface DashboardCosts {
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  currency: string;
  month_to_date: MonthToDateCost;
}

export interface DashboardMostActiveAgent {
  agent: AgentRef & { status: AgentStatus };
  calls: number;
  successful_calls: number;
  success_rate: number;
}

export interface DashboardRecentCall {
  id: string;
  call_number: number;
  direction: CallDirection;
  status: CallStatus;
  is_test: boolean;
  contact_name: string | null;
  to_number: string | null;
  from_number: string | null;
  outcome_key: string | null;
  outcome_label: string | null;
  is_successful: boolean | null;
  duration_seconds: number | null;
  total_cost: number;
  currency: string;
  started_at: string | null;
  created_at: string;
  agent: AgentRef;
}

export interface DashboardAttentionReason {
  type: AttentionReasonType;
  message: string;
  action_id?: string;
  tool_key?: string;
  action_status?: string;
}

export interface DashboardAttentionCall {
  id: string;
  call_number: number;
  status: CallStatus;
  contact_name: string | null;
  to_number: string | null;
  error_code: string | null;
  error_message: string | null;
  disconnect_reason: string | null;
  started_at: string | null;
  created_at: string;
  agent: AgentRef;
  reason: DashboardAttentionReason;
}

export interface DashboardFollowUp {
  id: string;
  scheduled_for: string;
  source: ScheduledCallSource;
  attempt_number: number;
  agent: AgentRef;
  contact: { id: string; name: string | null; phone: string | null };
}

export interface DashboardResponse {
  period: PeriodInfo;
  summary: DashboardSummary;
  calls_over_time: {
    bucket: TimeBucket;
    points: TimeseriesPoint[];
    previous_points: TimeseriesPoint[];
  };
  successful_vs_unsuccessful: { successful: number; unsuccessful: number; unknown: number };
  outcome_breakdown: OutcomeCount[];
  most_active_agents: DashboardMostActiveAgent[];
  estimated_costs: DashboardCosts;
  recent_calls: DashboardRecentCall[];
  failed_calls_needing_attention: DashboardAttentionCall[];
  pending_follow_ups: { total: number; items: DashboardFollowUp[] };
  open_alerts_count: number | null;
}
