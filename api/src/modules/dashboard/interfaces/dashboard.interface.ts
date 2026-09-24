import { ActionStatus, AgentStatus, CallDirection, CallStatus, ScheduledCallSource } from 'generated/prisma';

export type PeriodKey = 'today' | '7d' | '30d' | 'custom';
export type TimeBucket = 'hour' | 'day' | 'week';

export interface ResolvedPeriod {
  period: PeriodKey;
  timezone: string;
  from: Date;
  to: Date;
  from_iso: string;
  to_iso: string;
}

export interface CostTotals {
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  currency: string;
}

export interface CallTotals {
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  transferred_calls: number;
  no_answer_calls: number;
  successful_calls: number;
  unsuccessful_calls: number;
  pending_analysis_calls: number;
  total_seconds: number;
  average_duration_seconds: number;
  costs: CostTotals;
}

export interface OutcomeCount {
  key: string | null;
  label: string | null;
  /** Whether the agent counts this outcome as a success. */
  is_successful: boolean;
  count: number;
}

export interface TimeseriesPoint {
  bucket_start: string;
  calls: number;
  successful_calls: number;
  unsuccessful_calls: number;
  minutes: number;
  ai_cost: number;
  telephony_cost: number;
  cost: number;
}

export interface ConversionCounts {
  interested_leads: number;
  appointments_booked: number;
}

export interface AgentRef {
  id: string;
  name: string;
}

export interface AgentRefWithStatus extends AgentRef {
  status: AgentStatus;
}

export interface DashboardComparison {
  total_calls: number;
  successful_calls: number;
  interested_leads: number;
  appointments_booked: number;
  average_call_duration_seconds: number;
  total_cost: number;
}

export interface DashboardSummary extends ConversionCounts {
  total_calls: number;
  calls_today: number;
  successful_calls: number;
  success_rate: number;
  average_call_duration_seconds: number;
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  currency: string;
  /** The equally long window right before the selected period (e.g. yesterday for "today"). */
  previous: DashboardComparison;
}

export interface MonthToDateCost {
  total_cost: number;
  projected_total_cost: number;
  days_elapsed: number;
  days_in_month: number;
  month_end: string;
}

export interface DashboardMostActiveAgent {
  agent: AgentRefWithStatus;
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
  started_at: Date | null;
  created_at: Date;
  agent: AgentRef;
}

export type AttentionReason =
  | { type: 'call_failed'; message: string }
  | {
      type: 'crm_update_failed';
      message: string;
      action_id?: string;
      tool_key?: string;
      action_status?: ActionStatus;
    };

export interface DashboardAttentionCall {
  id: string;
  call_number: number;
  status: CallStatus;
  contact_name: string | null;
  to_number: string | null;
  error_code: string | null;
  error_message: string | null;
  disconnect_reason: string | null;
  started_at: Date | null;
  created_at: Date;
  agent: AgentRef;
  reason: AttentionReason;
}

export interface DashboardFollowUp {
  id: string;
  scheduled_for: Date;
  source: ScheduledCallSource;
  attempt_number: number;
  agent: AgentRef;
  contact: { id: string; name: string | null; phone: string | null };
}

export interface DashboardResponse {
  period: { period: PeriodKey; from: string; to: string; timezone: string };
  summary: DashboardSummary;
  calls_over_time: {
    bucket: TimeBucket;
    points: TimeseriesPoint[];
    /** Same buckets for the previous period, aligned by index. */
    previous_points: TimeseriesPoint[];
  };
  successful_vs_unsuccessful: { successful: number; unsuccessful: number; unknown: number };
  outcome_breakdown: OutcomeCount[];
  most_active_agents: DashboardMostActiveAgent[];
  estimated_costs: CostTotals & { month_to_date: MonthToDateCost };
  recent_calls: DashboardRecentCall[];
  failed_calls_needing_attention: DashboardAttentionCall[];
  pending_follow_ups: { total: number; items: DashboardFollowUp[] };
  open_alerts_count: number | null;
}

export interface UsageTotals {
  total_calls: number;
  total_minutes: number;
  completed_calls: number;
  failed_calls: number;
  transferred_calls: number;
  no_answer_calls: number;
  successful_calls: number;
  success_rate: number;
  average_call_duration_seconds: number;
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  average_cost_per_call: number;
  cost_per_successful_outcome: number | null;
  currency: string;
}

export interface AgentUsage {
  agent: AgentRefWithStatus;
  calls_made: number;
  success_rate: number;
  average_duration_seconds: number;
  average_cost: number;
  outcomes: OutcomeCount[];
}
