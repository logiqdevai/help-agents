import type { FC } from "react";
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card";
import { getDashboardPeriodDescription } from "@/config/constants/dropdowns/dashboard/dashboard-period-description.options";
import type { DashboardPeriod, DashboardSummary } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatDuration, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { TrendKinds, TrendNote } from "@/views/dashboard/components/trend-note";

interface DashboardKpisProps {
  summary: DashboardSummary;
  period: DashboardPeriod;
}

export const DashboardKpis: FC<DashboardKpisProps> = ({ summary, period }) => {
  const { previous } = summary;
  const { callsLabel, aiCostLabel, comparison } = getDashboardPeriodDescription(period);

  return (
    <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={callsLabel}
        value={formatNumber(summary.total_calls)}
        note={
          <TrendNote
            current={summary.total_calls}
            previous={previous.total_calls}
            comparedWith={comparison}
            formatPrevious={formatNumber}
          />
        }
      />
      <StatCard
        label="Successful calls"
        value={formatNumber(summary.successful_calls)}
        note={
          <>
            <span className="font-medium text-foreground">{formatPercent(summary.success_rate)}</span>
            <span>reached a success outcome</span>
          </>
        }
      />
      <StatCard
        label="Interested leads"
        value={formatNumber(summary.interested_leads)}
        note={
          <TrendNote current={summary.interested_leads} previous={previous.interested_leads} comparedWith={comparison} />
        }
      />
      <StatCard
        label="Appointments booked"
        value={formatNumber(summary.appointments_booked)}
        note={
          <TrendNote
            current={summary.appointments_booked}
            previous={previous.appointments_booked}
            comparedWith={comparison}
            formatPrevious={formatNumber}
          />
        }
      />
      <StatCard
        label="Average call length"
        value={formatDuration(summary.average_call_duration_seconds)}
        note={
          <TrendNote
            current={summary.average_call_duration_seconds}
            previous={previous.average_call_duration_seconds}
            kind={TrendKinds.SECONDS}
            comparedWith={comparison}
          />
        }
      />
      <StatCard
        label={aiCostLabel}
        value={formatMoney(summary.ai_cost, summary.currency)}
        note={`Telephony ${formatMoney(summary.telephony_cost, summary.currency)} · total ${formatMoney(summary.total_cost, summary.currency)}`}
      />
    </section>
  );
};

export const DashboardKpisSkeleton: FC = () => (
  <section aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <StatCardSkeleton key={index} />
    ))}
  </section>
);
