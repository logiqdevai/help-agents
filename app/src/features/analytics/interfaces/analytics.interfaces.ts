export const UsagePeriods = {
  TODAY: "today",
  LAST_7_DAYS: "7d",
  LAST_30_DAYS: "30d",
  CUSTOM: "custom",
} as const;
export type UsagePeriod = (typeof UsagePeriods)[keyof typeof UsagePeriods];

export const TimeBuckets = {
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
} as const;
export type TimeBucket = (typeof TimeBuckets)[keyof typeof TimeBuckets];

export const AgentStatuses = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type AgentStatus = (typeof AgentStatuses)[keyof typeof AgentStatuses];

export interface PeriodQuery {
  period: UsagePeriod;
  /** ISO date (yyyy-MM-dd), required when `period` is "custom". */
  from?: string;
  to?: string;
  include_test?: boolean;
}

export interface UsageQuery extends PeriodQuery {
  agent_uuid?: string;
}

export interface UsageTimeseriesQuery extends UsageQuery {
  bucket?: TimeBucket;
}

export interface PeriodInfo {
  period: UsagePeriod;
  from: string;
  to: string;
  timezone: string;
}

export interface OutcomeCount {
  key: string | null;
  label: string | null;
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
  agent: { id: string; name: string; status: AgentStatus };
  calls_made: number;
  success_rate: number;
  average_duration_seconds: number;
  average_cost: number;
  outcomes: OutcomeCount[];
}

export interface UsageReport {
  period: PeriodInfo;
  totals: UsageTotals;
  outcomes: OutcomeCount[];
  agents: AgentUsage[];
}

export interface UsageTimeseries {
  period: PeriodInfo;
  bucket: TimeBucket;
  points: TimeseriesPoint[];
}

export interface AgentFilterOption {
  id: string;
  name: string;
}
