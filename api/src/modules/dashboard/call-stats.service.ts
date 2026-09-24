import { Injectable } from '@nestjs/common';
import { ActionKind, ActionStatus, CallStatus, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CANONICAL_ACTION_KEYS } from '@/shared/constants/crm-fields';
import {
  CallTotals,
  ConversionCounts,
  OutcomeCount,
  ResolvedPeriod,
  TimeBucket,
  TimeseriesPoint,
} from './interfaces/dashboard.interface';
import { toOutcomeCounts } from './utils/outcome.utils';
import { bucketKey, enumerateBuckets, round, toNumber } from './utils/period.utils';

export interface CallScope {
  company_uuid: string;
  /** Agents the caller may see; null = unrestricted (see AgentAccessService). */
  accessible_agent_ids: string[] | null;
  agent_uuid?: string;
  include_test?: boolean;
}

const EXCLUDED_STATUSES = [CallStatus.SCHEDULED, CallStatus.CANCELED];
const DEFAULT_CURRENCY = 'EUR';
/** Keys of the default outcomes every agent starts with (see DEFAULT_OUTCOMES). */
const INTERESTED_OUTCOME_KEY = 'interested';
const APPOINTMENT_OUTCOME_KEY = 'appointment_requested';

/** Shared call aggregation used by the dashboard and the usage reports. */
@Injectable()
export class CallStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the agent filter; null = unrestricted, [] = nothing visible. */
  effectiveAgentIds(scope: CallScope): string[] | null {
    const { accessible_agent_ids: allowed, agent_uuid } = scope;
    if (allowed === null) return agent_uuid ? [agent_uuid] : null;
    if (agent_uuid) return allowed.includes(agent_uuid) ? [agent_uuid] : [];
    return allowed;
  }

  buildWhere(scope: CallScope, period: Pick<ResolvedPeriod, 'from' | 'to'>): Prisma.CallWhereInput {
    const agentIds = this.effectiveAgentIds(scope);
    const range = { gte: period.from, lte: period.to };

    return {
      company_uuid: scope.company_uuid,
      status: { notIn: EXCLUDED_STATUSES },
      ...(scope.include_test ? {} : { is_test: false }),
      ...(agentIds === null ? {} : { agent_uuid: { in: agentIds } }),
      OR: [{ started_at: range }, { started_at: null, created_at: range }],
    };
  }

  async totals(where: Prisma.CallWhereInput): Promise<CallTotals> {
    const [byStatus, bySuccess, duration, costRows] = await Promise.all([
      this.prisma.call.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.call.groupBy({ by: ['is_successful'], where, _count: { _all: true } }),
      this.prisma.call.aggregate({
        where,
        _sum: { duration_seconds: true },
        _avg: { duration_seconds: true },
      }),
      this.prisma.call.groupBy({
        by: ['currency'],
        where,
        _sum: { ai_cost: true, telephony_cost: true, total_cost: true },
      }),
    ]);

    const statusCount = (...statuses: CallStatus[]) =>
      byStatus
        .filter((r) => statuses.includes(r.status))
        .reduce((sum, r) => sum + r._count._all, 0);
    const successCount = (value: boolean | null) =>
      bySuccess.find((r) => r.is_successful === value)?._count._all ?? 0;

    const total_calls = byStatus.reduce((sum, r) => sum + r._count._all, 0);
    const primaryCost = [...costRows].sort(
      (a, b) => toNumber(b._sum.total_cost) - toNumber(a._sum.total_cost),
    )[0];

    return {
      total_calls,
      completed_calls: statusCount(CallStatus.COMPLETED, CallStatus.TRANSFERRED),
      failed_calls: statusCount(CallStatus.FAILED),
      transferred_calls: statusCount(CallStatus.TRANSFERRED),
      no_answer_calls: statusCount(CallStatus.NO_ANSWER, CallStatus.BUSY),
      successful_calls: successCount(true),
      unsuccessful_calls: successCount(false),
      pending_analysis_calls: successCount(null),
      total_seconds: toNumber(duration._sum.duration_seconds),
      average_duration_seconds: Math.round(toNumber(duration._avg.duration_seconds)),
      costs: {
        ai_cost: round(toNumber(primaryCost?._sum.ai_cost), 4),
        telephony_cost: round(toNumber(primaryCost?._sum.telephony_cost), 4),
        total_cost: round(toNumber(primaryCost?._sum.total_cost), 4),
        currency: primaryCost?.currency ?? DEFAULT_CURRENCY,
      },
    };
  }

  /** Interested leads, and appointments (requested by the caller or booked in a connected calendar). */
  async conversions(where: Prisma.CallWhereInput): Promise<ConversionCounts> {
    const [interested_leads, appointments_booked] = await Promise.all([
      this.prisma.call.count({ where: { AND: [where, { outcome_key: INTERESTED_OUTCOME_KEY }] } }),
      this.prisma.call.count({
        where: {
          AND: [
            where,
            {
              OR: [
                { outcome_key: APPOINTMENT_OUTCOME_KEY },
                {
                  actions: {
                    some: {
                      kind: ActionKind.CALENDAR,
                      tool_key: CANONICAL_ACTION_KEYS.CALENDAR_CREATE_EVENT,
                      status: ActionStatus.EXECUTED,
                    },
                  },
                },
              ],
            },
          ],
        },
      }),
    ]);

    return { interested_leads, appointments_booked };
  }

  async outcomeBreakdown(where: Prisma.CallWhereInput): Promise<OutcomeCount[]> {
    const rows = await this.prisma.call.groupBy({
      by: ['outcome_key', 'outcome_label', 'is_successful'],
      where,
      _count: { _all: true },
    });

    return toOutcomeCounts(rows);
  }

  /** Zero-filled series bucketed in the company timezone. */
  async timeseries(
    scope: CallScope,
    period: ResolvedPeriod,
    bucket: TimeBucket,
  ): Promise<TimeseriesPoint[]> {
    const buckets = enumerateBuckets(period, bucket);
    const agentIds = this.effectiveAgentIds(scope);

    const values = new Map<string, Omit<TimeseriesPoint, 'bucket_start'>>();

    if (agentIds === null || agentIds.length > 0) {
      const conditions: Prisma.Sql[] = [
        Prisma.sql`company_uuid = ${scope.company_uuid}`,
        Prisma.sql`status::text NOT IN (${Prisma.join(EXCLUDED_STATUSES)})`,
        Prisma.sql`COALESCE(started_at, created_at) >= (${period.from.toISOString()}::timestamptz AT TIME ZONE 'UTC')`,
        Prisma.sql`COALESCE(started_at, created_at) <= (${period.to.toISOString()}::timestamptz AT TIME ZONE 'UTC')`,
      ];
      if (!scope.include_test) conditions.push(Prisma.sql`is_test = false`);
      if (agentIds !== null) conditions.push(Prisma.sql`agent_uuid IN (${Prisma.join(agentIds)})`);

      const rows = await this.prisma.$queryRaw<
        Array<{
          bucket: string;
          calls: number;
          successful: number;
          unsuccessful: number;
          seconds: number;
          ai_cost: number;
          telephony_cost: number;
          cost: number;
        }>
      >(Prisma.sql`
        SELECT
          to_char(
            date_trunc(${bucket}::text, (COALESCE(started_at, created_at) AT TIME ZONE 'UTC') AT TIME ZONE ${period.timezone}::text),
            'YYYY-MM-DD"T"HH24:MI:SS'
          ) AS bucket,
          COUNT(*)::int AS calls,
          (COUNT(*) FILTER (WHERE is_successful = true))::int AS successful,
          (COUNT(*) FILTER (WHERE is_successful = false))::int AS unsuccessful,
          COALESCE(SUM(duration_seconds), 0)::float8 AS seconds,
          COALESCE(SUM(ai_cost), 0)::float8 AS ai_cost,
          COALESCE(SUM(telephony_cost), 0)::float8 AS telephony_cost,
          COALESCE(SUM(total_cost), 0)::float8 AS cost
        FROM calls
        WHERE ${Prisma.join(conditions, ' AND ')}
        GROUP BY 1
        ORDER BY 1
      `);

      for (const row of rows) {
        values.set(row.bucket, {
          calls: Number(row.calls),
          successful_calls: Number(row.successful),
          unsuccessful_calls: Number(row.unsuccessful),
          minutes: round(Number(row.seconds) / 60, 2),
          ai_cost: round(Number(row.ai_cost), 4),
          telephony_cost: round(Number(row.telephony_cost), 4),
          cost: round(Number(row.cost), 4),
        });
      }
    }

    return buckets.map((dt) => ({
      bucket_start: dt.toISO(),
      ...(values.get(bucketKey(dt)) ?? {
        calls: 0,
        successful_calls: 0,
        unsuccessful_calls: 0,
        minutes: 0,
        ai_cost: 0,
        telephony_cost: 0,
        cost: 0,
      }),
    }));
  }
}
