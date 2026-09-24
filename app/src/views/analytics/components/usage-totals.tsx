import type { FC } from "react";
import Link from "next/link";
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card";
import type { PeriodInfo, UsageTotals as UsageTotalsData } from "@/features/analytics/interfaces/analytics.interfaces";
import { formatPeriodRange } from "@/features/analytics/utils/timeseries.utils";
import { formatDuration, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { Routes } from "@/routes/routes";

interface UsageTotalsProps {
  totals: UsageTotalsData;
  period: PeriodInfo;
}

export const UsageTotals: FC<UsageTotalsProps> = ({ totals, period }) => {
  const share = (count: number) => (totals.total_calls ? formatPercent((count / totals.total_calls) * 100) : "—");

  return (
    <section aria-label="Company totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total calls" value={formatNumber(totals.total_calls)} note={formatPeriodRange(period)} />
      <StatCard
        label="Total minutes"
        value={formatNumber(Math.round(totals.total_minutes))}
        note="Talk time across all calls"
      />
      <StatCard
        label="Completed calls"
        value={formatNumber(totals.completed_calls)}
        note={`${share(totals.completed_calls)} of all calls`}
      />
      <StatCard
        label="Failed calls"
        value={formatNumber(totals.failed_calls)}
        note={
          <Link href={Routes.calls.root} className="underline-offset-4 hover:text-foreground hover:underline">
            Review calls
          </Link>
        }
      />
      <StatCard
        label="Average call duration"
        value={formatDuration(totals.average_call_duration_seconds)}
        note="Per call, all agents"
      />
      <StatCard
        label="Total cost"
        value={formatMoney(totals.total_cost, totals.currency)}
        note={`AI ${formatMoney(totals.ai_cost, totals.currency)} · telephony ${formatMoney(totals.telephony_cost, totals.currency)}`}
      />
      <StatCard
        label="Average cost per call"
        value={formatMoney(totals.average_cost_per_call, totals.currency)}
        note={`${formatMoney(totals.total_cost, totals.currency)} ÷ ${formatNumber(totals.total_calls)} calls`}
      />
      <StatCard
        label="Cost per successful outcome"
        value={formatMoney(totals.cost_per_successful_outcome, totals.currency)}
        note={`${formatNumber(totals.successful_calls)} successful calls`}
      />
    </section>
  );
};

export const UsageTotalsSkeleton: FC = () => (
  <section aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <StatCardSkeleton key={index} />
    ))}
  </section>
);
