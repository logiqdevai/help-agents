"use client";

import type { FC } from "react";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { OutcomeBreakdownCard } from "@/components/ui/outcome-breakdown-card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { UsagePeriodFormOptions } from "@/config/constants/dropdowns/analytics/usage-period-form.options";
import {
  useGetAgentFilterOptions,
  useGetUsageReport,
  useGetUsageTimeseries,
} from "@/features/analytics/hooks/use-analytics";
import { formatPeriodRange } from "@/features/analytics/utils/timeseries.utils";
import { formatMoney, formatNumber } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { AgentsUsageTable } from "@/views/analytics/components/agents-usage-table";
import { SuccessRateCard } from "@/views/analytics/components/success-rate-card";
import { TimeseriesBarCard } from "@/views/analytics/components/timeseries-bar-card";
import { UsageToolbar } from "@/views/analytics/components/usage-toolbar";
import { UsageTotals, UsageTotalsSkeleton } from "@/views/analytics/components/usage-totals";
import { useExportUsageCsv } from "@/views/analytics/hooks/use-export-usage-csv";
import { useUsageFilters } from "@/views/analytics/hooks/use-usage-filters";

const AnalyticsPage: FC = () => {
  const filters = useUsageFilters();
  const usage = useGetUsageReport(filters.query, filters.isRangeValid);
  const timeseries = useGetUsageTimeseries(filters.query, filters.isRangeValid);
  const agentOptions = useGetAgentFilterOptions();
  const exportCsv = useExportUsageCsv(timeseries.data);

  const currency = usage.data?.totals.currency ?? "EUR";
  const periodLabel = getDropdownOptionLabel(UsagePeriodFormOptions, filters.period).toLowerCase();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Usage reports"
        description="How many calls your agents handled, what came out of them and what they cost."
        actions={
          <Button variant="outline" size="lg" disabled={!timeseries.data} onClick={exportCsv}>
            <DownloadIcon /> Export CSV
          </Button>
        }
      />

      <UsageToolbar
        period={filters.period}
        onPeriodChange={filters.setPeriod}
        isCustom={filters.isCustom}
        from={filters.from}
        to={filters.to}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        isRangeValid={filters.isRangeValid}
        agentId={filters.agentId}
        onAgentChange={filters.setAgentId}
        agents={agentOptions.data ?? []}
      />

      {filters.isRangeValid ? (
        <>
          {usage.isError ? (
            <ErrorState
              title="Could not load usage totals"
              message={usage.error.message}
              onRetry={() => usage.refetch()}
            />
          ) : usage.data ? (
            <UsageTotals totals={usage.data.totals} period={usage.data.period} />
          ) : (
            <UsageTotalsSkeleton />
          )}

          {timeseries.isError ? (
            <ErrorState
              title="Could not load usage over time"
              message={timeseries.error.message}
              onRetry={() => timeseries.refetch()}
            />
          ) : timeseries.data ? (
            <>
              <TimeseriesBarCard
                title={`Calls per ${timeseries.data.bucket}`}
                description={`Successful and unsuccessful calls, ${formatPeriodRange(timeseries.data.period)}`}
                caption="Calling hours apply, so periods without calls show no bar. Success is decided by each agent's own success outcomes."
                chartLabel={`Stacked bars of successful and unsuccessful calls for ${periodLabel}`}
                points={timeseries.data.points}
                bucket={timeseries.data.bucket}
                series={[
                  { key: "successful_calls", label: "Successful", tone: "ink" },
                  { key: "unsuccessful_calls", label: "Unsuccessful", tone: "muted" },
                ]}
                formatValue={formatNumber}
                formatAxisTick={String}
                emptyMessage="No calls in this period yet."
              />
              <TimeseriesBarCard
                title={`Cost per ${timeseries.data.bucket}`}
                description="AI cost and telephony cost"
                caption="A call always keeps the cost that was calculated when it happened, even if prices change later."
                chartLabel={`Stacked bars of AI and telephony cost for ${periodLabel}`}
                points={timeseries.data.points}
                bucket={timeseries.data.bucket}
                series={[
                  { key: "ai_cost", label: "AI", tone: "ink" },
                  { key: "telephony_cost", label: "Telephony", tone: "muted" },
                ]}
                formatValue={(value) => formatMoney(value, currency)}
                formatAxisTick={(value) => formatMoney(value, currency).replace(/\.00$/, "")}
                emptyMessage="No costs in this period yet."
              />
            </>
          ) : (
            <>
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </>
          )}

          {usage.data ? (
            <>
              <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <OutcomeBreakdownCard
                  title="Outcomes"
                  summary={`${formatNumber(usage.data.totals.total_calls)} calls`}
                  outcomes={usage.data.outcomes}
                  emptyMessage="Outcomes appear here once your agents have handled calls."
                />
                <SuccessRateCard totals={usage.data.totals} />
              </section>

              <section className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-medium">By agent</h3>
                  <span className="text-sm text-muted-foreground">{formatPeriodRange(usage.data.period)}</span>
                </div>
                <AgentsUsageTable agents={usage.data.agents} currency={currency} />
                <p className="text-sm text-muted-foreground">
                  Test calls placed from the agent editor are included in company totals.
                </p>
              </section>
            </>
          ) : usage.isError ? null : (
            <Skeleton className="h-80 w-full rounded-xl" />
          )}
        </>
      ) : null}
    </div>
  );
};

export default AnalyticsPage;
