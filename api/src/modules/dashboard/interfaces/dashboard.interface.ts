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
  count: number;
}

export interface TimeseriesPoint {
  bucket_start: string;
  calls: number;
  successful_calls: number;
  minutes: number;
  cost: number;
}

export interface DashboardSummary {
  total_calls: number;
  calls_today: number;
  successful_calls: number;
  success_rate: number;
  average_call_duration_seconds: number;
  ai_cost: number;
  telephony_cost: number;
  total_cost: number;
  currency: string;
}

export interface DashboardResponse {
  period: { period: PeriodKey; from: string; to: string; timezone: string };
  summary: DashboardSummary;
  calls_over_time: { bucket: TimeBucket; points: TimeseriesPoint[] };
  successful_vs_unsuccessful: { successful: number; unsuccessful: number; unknown: number };
  outcome_breakdown: OutcomeCount[];
  most_active_agents: Array<{
    agent: { id: string; name: string };
    calls: number;
    successful_calls: number;
    success_rate: number;
  }>;
  estimated_costs: CostTotals;
  recent_calls: any[];
  failed_calls_needing_attention: any[];
  pending_follow_ups: { total: number; items: any[] };
  open_alerts_count: number | null;
}

export interface UsageTotals {
  total_calls: number;
  total_minutes: number;
  completed_calls: number;
  failed_calls: number;
  average_call_duration_seconds: number;
  total_cost: number;
  average_cost_per_call: number;
  cost_per_successful_outcome: number | null;
  currency: string;
}

export interface AgentUsage {
  agent: { id: string; name: string };
  calls_made: number;
  success_rate: number;
  average_duration_seconds: number;
  average_cost: number;
  outcomes: OutcomeCount[];
}
