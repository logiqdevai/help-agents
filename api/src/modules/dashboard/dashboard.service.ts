import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionStatus, AlertStatus, CallStatus, ScheduledCallStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { CallScope, CallStatsService } from './call-stats.service';
import { DashboardQueryType } from './dto/period-query.schema';
import { DashboardResponse } from './interfaces/dashboard.interface';
import { defaultBucket, resolvePeriod, round, toNumber } from './utils/period.utils';

const ATTENTION_WINDOW_DAYS = 7;
const LIST_LIMIT = 20;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stats: CallStatsService,
    private readonly agentAccess: AgentAccessService,
  ) {}

  async getDashboard(ctx: CompanyContextData, query: DashboardQueryType): Promise<DashboardResponse> {
    const company = await this.prisma.company.findFirst({
      where: { id: ctx.company_uuid, deleted_at: null },
      select: { timezone: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const accessibleAgentIds = await this.agentAccess.getAccessibleAgentIds(ctx);
    const period = resolvePeriod(query, company.timezone);
    const scope: CallScope = {
      company_uuid: ctx.company_uuid,
      accessible_agent_ids: accessibleAgentIds,
      include_test: query.include_test,
    };
    const where = this.stats.buildWhere(scope, period);
    const bucket = defaultBucket(period);
    const todayPeriod = period.period === 'today' ? period : resolvePeriod({ period: 'today' }, company.timezone);

    const [
      totals,
      todayCount,
      outcomes,
      points,
      topAgents,
      recentCalls,
      attention,
      pendingFollowUps,
      openAlerts,
    ] = await Promise.all([
      this.stats.totals(where),
      period.period === 'today'
        ? Promise.resolve(null)
        : this.prisma.call.count({ where: this.stats.buildWhere(scope, todayPeriod) }),
      this.stats.outcomeBreakdown(where),
      this.stats.timeseries(scope, period, bucket),
      this.mostActiveAgents(where),
      this.recentCalls(ctx.company_uuid, accessibleAgentIds, query.include_test),
      this.failedCallsNeedingAttention(ctx.company_uuid, accessibleAgentIds, query.include_test),
      this.pendingFollowUps(ctx.company_uuid, accessibleAgentIds),
      accessibleAgentIds === null
        ? this.prisma.alert.count({
            where: { company_uuid: ctx.company_uuid, status: AlertStatus.OPEN },
          })
        : Promise.resolve(null),
    ]);

    const successRate = totals.total_calls
      ? round((totals.successful_calls / totals.total_calls) * 100, 1)
      : 0;

    return {
      period: {
        period: period.period,
        from: period.from_iso,
        to: period.to_iso,
        timezone: period.timezone,
      },
      summary: {
        total_calls: totals.total_calls,
        calls_today: todayCount ?? totals.total_calls,
        successful_calls: totals.successful_calls,
        success_rate: successRate,
        average_call_duration_seconds: totals.average_duration_seconds,
        ai_cost: totals.costs.ai_cost,
        telephony_cost: totals.costs.telephony_cost,
        total_cost: totals.costs.total_cost,
        currency: totals.costs.currency,
      },
      calls_over_time: { bucket, points },
      successful_vs_unsuccessful: {
        successful: totals.successful_calls,
        unsuccessful: totals.unsuccessful_calls,
        unknown: totals.pending_analysis_calls,
      },
      outcome_breakdown: outcomes,
      most_active_agents: topAgents,
      estimated_costs: totals.costs,
      recent_calls: recentCalls,
      failed_calls_needing_attention: attention,
      pending_follow_ups: pendingFollowUps,
      open_alerts_count: openAlerts,
    };
  }

  private async mostActiveAgents(where: Parameters<CallStatsService['totals']>[0]) {
    const top = await this.prisma.call.groupBy({
      by: ['agent_uuid'],
      where,
      _count: { _all: true },
      orderBy: { _count: { agent_uuid: 'desc' } },
      take: 5,
    });
    if (!top.length) return [];

    const agentIds = top.map((t) => t.agent_uuid);
    const [successRows, agents] = await Promise.all([
      this.prisma.call.groupBy({
        by: ['agent_uuid'],
        where: { AND: [where, { agent_uuid: { in: agentIds }, is_successful: true }] },
        _count: { _all: true },
      }),
      this.prisma.agent.findMany({
        where: { id: { in: agentIds } },
        select: { id: true, name: true },
      }),
    ]);

    return top.map((t) => {
      const successful = successRows.find((s) => s.agent_uuid === t.agent_uuid)?._count._all ?? 0;
      const calls = t._count._all;
      return {
        agent: {
          id: t.agent_uuid,
          name: agents.find((a) => a.id === t.agent_uuid)?.name ?? 'Unknown agent',
        },
        calls,
        successful_calls: successful,
        success_rate: calls ? round((successful / calls) * 100, 1) : 0,
      };
    });
  }

  private async recentCalls(companyUuid: string, agentIds: string[] | null, includeTest: boolean) {
    const calls = await this.prisma.call.findMany({
      where: {
        company_uuid: companyUuid,
        ...(includeTest ? {} : { is_test: false }),
        ...(agentIds === null ? {} : { agent_uuid: { in: agentIds } }),
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        call_number: true,
        direction: true,
        status: true,
        is_test: true,
        contact_name: true,
        to_number: true,
        from_number: true,
        outcome_key: true,
        outcome_label: true,
        is_successful: true,
        duration_seconds: true,
        total_cost: true,
        currency: true,
        started_at: true,
        created_at: true,
        agent: { select: { id: true, name: true } },
      },
    });

    return calls.map((c) => ({ ...c, total_cost: toNumber(c.total_cost) }));
  }

  private async failedCallsNeedingAttention(
    companyUuid: string,
    agentIds: string[] | null,
    includeTest: boolean,
  ) {
    const since = new Date(Date.now() - ATTENTION_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const problemActionStatuses = [ActionStatus.NEEDS_ATTENTION, ActionStatus.FAILED];

    const calls = await this.prisma.call.findMany({
      where: {
        company_uuid: companyUuid,
        created_at: { gte: since },
        ...(includeTest ? {} : { is_test: false }),
        ...(agentIds === null ? {} : { agent_uuid: { in: agentIds } }),
        OR: [
          { status: CallStatus.FAILED },
          { actions: { some: { status: { in: problemActionStatuses } } } },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: LIST_LIMIT,
      select: {
        id: true,
        call_number: true,
        status: true,
        contact_name: true,
        to_number: true,
        error_code: true,
        error_message: true,
        disconnect_reason: true,
        started_at: true,
        created_at: true,
        agent: { select: { id: true, name: true } },
        actions: {
          where: { status: { in: problemActionStatuses } },
          orderBy: { updated_at: 'desc' },
          take: 1,
          select: { id: true, tool_key: true, status: true, last_error: true },
        },
      },
    });

    return calls.map(({ actions, ...call }) => {
      const action = actions[0];
      const reason =
        call.status === CallStatus.FAILED
          ? {
              type: 'call_failed',
              message: call.error_message ?? call.disconnect_reason ?? 'Call failed',
            }
          : {
              type: 'crm_update_failed',
              message: action?.last_error ?? 'A follow-up action failed',
              action_id: action?.id,
              tool_key: action?.tool_key,
              action_status: action?.status,
            };
      return { ...call, reason };
    });
  }

  private async pendingFollowUps(companyUuid: string, agentIds: string[] | null) {
    const where = {
      company_uuid: companyUuid,
      status: ScheduledCallStatus.PENDING,
      ...(agentIds === null ? {} : { agent_uuid: { in: agentIds } }),
    };

    const [total, items] = await Promise.all([
      this.prisma.scheduledCall.count({ where }),
      this.prisma.scheduledCall.findMany({
        where,
        orderBy: { scheduled_for: 'asc' },
        take: LIST_LIMIT,
        select: {
          id: true,
          scheduled_for: true,
          source: true,
          attempt_number: true,
          agent: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true, phone: true } },
        },
      }),
    ]);

    return { total, items };
  }
}
