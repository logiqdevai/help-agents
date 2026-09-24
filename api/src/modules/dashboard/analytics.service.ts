import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { CallScope, CallStatsService } from './call-stats.service';
import { UsageQueryType, UsageTimeseriesQueryType } from './dto/period-query.schema';
import { AgentUsage, UsageTotals } from './interfaces/dashboard.interface';
import { toOutcomeCounts } from './utils/outcome.utils';
import { defaultBucket, resolvePeriod, round, toNumber } from './utils/period.utils';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stats: CallStatsService,
    private readonly agentAccess: AgentAccessService,
  ) {}

  private async getCompanyTimezone(companyUuid: string): Promise<string> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyUuid, deleted_at: null },
      select: { timezone: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company.timezone;
  }

  async getUsage(ctx: CompanyContextData, query: UsageQueryType) {
    const timezone = await this.getCompanyTimezone(ctx.company_uuid);
    const period = resolvePeriod(query, timezone);
    const scope: CallScope = {
      company_uuid: ctx.company_uuid,
      accessible_agent_ids: await this.agentAccess.getAccessibleAgentIds(ctx),
      agent_uuid: query.agent_uuid,
      include_test: query.include_test,
    };
    const where = this.stats.buildWhere(scope, period);

    const [totals, outcomes, agents] = await Promise.all([
      this.stats.totals(where),
      this.stats.outcomeBreakdown(where),
      this.perAgent(where, scope),
    ]);

    const usage: UsageTotals = {
      total_calls: totals.total_calls,
      total_minutes: round(totals.total_seconds / 60, 2),
      completed_calls: totals.completed_calls,
      failed_calls: totals.failed_calls,
      transferred_calls: totals.transferred_calls,
      no_answer_calls: totals.no_answer_calls,
      successful_calls: totals.successful_calls,
      success_rate: totals.total_calls
        ? round((totals.successful_calls / totals.total_calls) * 100, 1)
        : 0,
      average_call_duration_seconds: totals.average_duration_seconds,
      ai_cost: totals.costs.ai_cost,
      telephony_cost: totals.costs.telephony_cost,
      total_cost: totals.costs.total_cost,
      average_cost_per_call: totals.total_calls
        ? round(totals.costs.total_cost / totals.total_calls, 4)
        : 0,
      cost_per_successful_outcome: totals.successful_calls
        ? round(totals.costs.total_cost / totals.successful_calls, 4)
        : null,
      currency: totals.costs.currency,
    };

    return {
      period: {
        period: period.period,
        from: period.from_iso,
        to: period.to_iso,
        timezone: period.timezone,
      },
      totals: usage,
      outcomes,
      agents,
    };
  }

  async getTimeseries(ctx: CompanyContextData, query: UsageTimeseriesQueryType) {
    const timezone = await this.getCompanyTimezone(ctx.company_uuid);
    const period = resolvePeriod(query, timezone);
    const bucket = query.bucket ?? defaultBucket(period);
    const scope: CallScope = {
      company_uuid: ctx.company_uuid,
      accessible_agent_ids: await this.agentAccess.getAccessibleAgentIds(ctx),
      agent_uuid: query.agent_uuid,
      include_test: query.include_test,
    };

    const points = await this.stats.timeseries(scope, period, bucket);

    return {
      period: {
        period: period.period,
        from: period.from_iso,
        to: period.to_iso,
        timezone: period.timezone,
      },
      bucket,
      points,
    };
  }

  /** One row per visible agent: agents without calls in the period are listed with zeroes. */
  private async perAgent(
    where: Parameters<CallStatsService['totals']>[0],
    scope: CallScope,
  ): Promise<AgentUsage[]> {
    const [callRows, successRows, outcomeRows] = await Promise.all([
      this.prisma.call.groupBy({
        by: ['agent_uuid'],
        where,
        _count: { _all: true },
        _avg: { duration_seconds: true, total_cost: true },
      }),
      this.prisma.call.groupBy({
        by: ['agent_uuid'],
        where: { AND: [where, { is_successful: true }] },
        _count: { _all: true },
      }),
      this.prisma.call.groupBy({
        by: ['agent_uuid', 'outcome_key', 'outcome_label', 'is_successful'],
        where,
        _count: { _all: true },
      }),
    ]);

    const visibleAgentIds = this.stats.effectiveAgentIds(scope);
    const agents = await this.prisma.agent.findMany({
      where: {
        company_uuid: scope.company_uuid,
        OR: [
          { id: { in: callRows.map((r) => r.agent_uuid) } },
          { deleted_at: null, ...(visibleAgentIds === null ? {} : { id: { in: visibleAgentIds } }) },
        ],
      },
      select: { id: true, name: true, status: true },
    });

    return agents
      .map((agent) => {
        const row = callRows.find((r) => r.agent_uuid === agent.id);
        const calls = row?._count._all ?? 0;
        const successful = successRows.find((s) => s.agent_uuid === agent.id)?._count._all ?? 0;
        const outcomes = toOutcomeCounts(outcomeRows.filter((o) => o.agent_uuid === agent.id));

        return {
          agent,
          calls_made: calls,
          success_rate: calls ? round((successful / calls) * 100, 1) : 0,
          average_duration_seconds: Math.round(toNumber(row?._avg.duration_seconds)),
          average_cost: round(toNumber(row?._avg.total_cost), 4),
          outcomes,
        };
      })
      .sort((a, b) => b.calls_made - a.calls_made || a.agent.name.localeCompare(b.agent.name));
  }
}
