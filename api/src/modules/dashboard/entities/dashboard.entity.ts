import { ApiProperty } from '@nestjs/swagger';

class PeriodInfo {
  @ApiProperty({ enum: ['today', '7d', '30d', 'custom'] }) period: string;
  @ApiProperty() from: string;
  @ApiProperty() to: string;
  @ApiProperty({ example: 'Europe/Athens' }) timezone: string;
}

class CostTotalsEntity {
  @ApiProperty() ai_cost: number;
  @ApiProperty() telephony_cost: number;
  @ApiProperty() total_cost: number;
  @ApiProperty({ example: 'EUR' }) currency: string;
}

class DashboardComparisonEntity {
  @ApiProperty() total_calls: number;
  @ApiProperty() successful_calls: number;
  @ApiProperty() interested_leads: number;
  @ApiProperty() appointments_booked: number;
  @ApiProperty() average_call_duration_seconds: number;
  @ApiProperty() total_cost: number;
}

class MonthToDateCostEntity {
  @ApiProperty() total_cost: number;
  @ApiProperty() projected_total_cost: number;
  @ApiProperty() days_elapsed: number;
  @ApiProperty() days_in_month: number;
  @ApiProperty({ example: '2026-09-30' }) month_end: string;
}

class EstimatedCostsEntity extends CostTotalsEntity {
  @ApiProperty({ type: MonthToDateCostEntity }) month_to_date: MonthToDateCostEntity;
}

class DashboardSummaryEntity {
  @ApiProperty() total_calls: number;
  @ApiProperty() calls_today: number;
  @ApiProperty() successful_calls: number;
  @ApiProperty({ description: 'Percentage 0-100' }) success_rate: number;
  @ApiProperty({ description: 'Calls whose outcome is "interested"' }) interested_leads: number;
  @ApiProperty({ description: 'Calls that requested or booked an appointment' }) appointments_booked: number;
  @ApiProperty() average_call_duration_seconds: number;
  @ApiProperty() ai_cost: number;
  @ApiProperty() telephony_cost: number;
  @ApiProperty() total_cost: number;
  @ApiProperty() currency: string;
  @ApiProperty({ type: DashboardComparisonEntity, description: 'The equally long window before the period' })
  previous: DashboardComparisonEntity;
}

class OutcomeCountEntity {
  @ApiProperty({ nullable: true, type: String }) key: string | null;
  @ApiProperty({ nullable: true, type: String }) label: string | null;
  @ApiProperty({ description: 'Whether the agent counts this outcome as a success' }) is_successful: boolean;
  @ApiProperty() count: number;
}

class TimeseriesPointEntity {
  @ApiProperty() bucket_start: string;
  @ApiProperty() calls: number;
  @ApiProperty() successful_calls: number;
  @ApiProperty() unsuccessful_calls: number;
  @ApiProperty() minutes: number;
  @ApiProperty() ai_cost: number;
  @ApiProperty() telephony_cost: number;
  @ApiProperty() cost: number;
}

class CallsOverTimeEntity {
  @ApiProperty({ enum: ['hour', 'day', 'week'] }) bucket: string;
  @ApiProperty({ type: [TimeseriesPointEntity] }) points: TimeseriesPointEntity[];
  @ApiProperty({ type: [TimeseriesPointEntity], description: 'Previous period, aligned by index' })
  previous_points: TimeseriesPointEntity[];
}

class SuccessSplitEntity {
  @ApiProperty() successful: number;
  @ApiProperty() unsuccessful: number;
  @ApiProperty({ description: 'Calls still awaiting analysis' }) unknown: number;
}

export class DashboardResponseEntity {
  @ApiProperty({ type: PeriodInfo }) period: PeriodInfo;
  @ApiProperty({ type: DashboardSummaryEntity }) summary: DashboardSummaryEntity;
  @ApiProperty({ type: CallsOverTimeEntity }) calls_over_time: CallsOverTimeEntity;
  @ApiProperty({ type: SuccessSplitEntity }) successful_vs_unsuccessful: SuccessSplitEntity;
  @ApiProperty({ type: [OutcomeCountEntity] }) outcome_breakdown: OutcomeCountEntity[];
  @ApiProperty({ type: 'array', items: { type: 'object' } }) most_active_agents: object[];
  @ApiProperty({ type: EstimatedCostsEntity }) estimated_costs: EstimatedCostsEntity;
  @ApiProperty({ type: 'array', items: { type: 'object' } }) recent_calls: object[];
  @ApiProperty({ type: 'array', items: { type: 'object' } }) failed_calls_needing_attention: object[];
  @ApiProperty({ type: 'object', additionalProperties: true }) pending_follow_ups: object;
  @ApiProperty({ nullable: true, type: Number }) open_alerts_count: number | null;
}

class UsageTotalsEntity {
  @ApiProperty() total_calls: number;
  @ApiProperty() total_minutes: number;
  @ApiProperty() completed_calls: number;
  @ApiProperty() failed_calls: number;
  @ApiProperty() transferred_calls: number;
  @ApiProperty() no_answer_calls: number;
  @ApiProperty() successful_calls: number;
  @ApiProperty({ description: 'Percentage 0-100' }) success_rate: number;
  @ApiProperty() average_call_duration_seconds: number;
  @ApiProperty() ai_cost: number;
  @ApiProperty() telephony_cost: number;
  @ApiProperty() total_cost: number;
  @ApiProperty() average_cost_per_call: number;
  @ApiProperty({ nullable: true, type: Number }) cost_per_successful_outcome: number | null;
  @ApiProperty() currency: string;
}

export class UsageReportEntity {
  @ApiProperty({ type: PeriodInfo }) period: PeriodInfo;
  @ApiProperty({ type: UsageTotalsEntity }) totals: UsageTotalsEntity;
  @ApiProperty({ type: [OutcomeCountEntity] }) outcomes: OutcomeCountEntity[];
  @ApiProperty({ type: 'array', items: { type: 'object' } }) agents: object[];
}

export class UsageTimeseriesEntity {
  @ApiProperty({ type: PeriodInfo }) period: PeriodInfo;
  @ApiProperty({ enum: ['hour', 'day', 'week'] }) bucket: string;
  @ApiProperty({ type: [TimeseriesPointEntity] }) points: TimeseriesPointEntity[];
}
