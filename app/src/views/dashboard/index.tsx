"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PhoneCallIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { OutcomeBreakdownCard } from "@/components/ui/outcome-breakdown-card";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DashboardPeriodFormOptions } from "@/config/constants/dropdowns/dashboard/dashboard-period-form.options";
import { getDashboardPeriodDescription } from "@/config/constants/dropdowns/dashboard/dashboard-period-description.options";
import { useGetDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPeriods, type DashboardPeriod } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { AttentionBanner } from "@/views/dashboard/components/attention-banner";
import { AttentionCard } from "@/views/dashboard/components/attention-card";
import { CallsOverTimeCard } from "@/views/dashboard/components/calls-over-time-card";
import { DashboardKpis } from "@/views/dashboard/components/dashboard-kpis";
import { DashboardSkeleton } from "@/views/dashboard/components/dashboard-skeleton";
import { EstimatedCostCard } from "@/views/dashboard/components/estimated-cost-card";
import { FollowUpsCard } from "@/views/dashboard/components/follow-ups-card";
import { MostActiveAgentsCard } from "@/views/dashboard/components/most-active-agents-card";
import { RecentCallsTable } from "@/views/dashboard/components/recent-calls-table";
import { SuccessSplitCard } from "@/views/dashboard/components/success-split-card";

const GREETING_HOURS = { MORNING_UNTIL: 12, AFTERNOON_UNTIL: 18 } as const;

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < GREETING_HOURS.MORNING_UNTIL) return "Good morning";
  if (hour < GREETING_HOURS.AFTERNOON_UNTIL) return "Good afternoon";
  return "Good evening";
}

const DashboardPage: FC = () => {
  const [period, setPeriod] = useState<DashboardPeriod>(DashboardPeriods.TODAY);
  const { data, isPending, isError, error, refetch } = useGetDashboard({ period });
  const user = useAuthStore((state) => state.user);
  const companyName = useAuthStore((state) => state.companies.find((c) => c.id === state.activeCompanyId)?.name);

  const now = new Date();
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const { summary } = getDashboardPeriodDescription(period);
  const context = [format(now, "EEEE d MMMM"), companyName, data?.period.timezone].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title={firstName ? `${greetingFor(now)}, ${firstName}` : greetingFor(now)}
        description={`${context}. Here is what your agents did ${summary}.`}
        actions={
          <>
            <SegmentedControl
              aria-label="Time period"
              value={period}
              onValueChange={setPeriod}
              options={DashboardPeriodFormOptions}
            />
            <Link href={Routes.calls.root} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              <PhoneCallIcon /> View all calls
            </Link>
          </>
        }
      />

      <AttentionBanner />

      {isError ? (
        <ErrorState title="Could not load the dashboard" message={error.message} onRetry={() => refetch()} />
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardKpis summary={data.summary} period={period} />

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <CallsOverTimeCard
              period={period}
              bucket={data.calls_over_time.bucket}
              points={data.calls_over_time.points}
              previousPoints={data.calls_over_time.previous_points}
            />
            <div className="flex flex-col gap-4">
              <SuccessSplitCard split={data.successful_vs_unsuccessful} />
              <EstimatedCostCard costs={data.estimated_costs} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <OutcomeBreakdownCard
              title="Call outcomes"
              summary={`${formatNumber(data.summary.total_calls)} calls`}
              outcomes={data.outcome_breakdown}
              emptyMessage="Outcomes appear here once your agents have handled calls."
            />
            <MostActiveAgentsCard agents={data.most_active_agents} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <AttentionCard calls={data.failed_calls_needing_attention} />
            <FollowUpsCard followUps={data.pending_follow_ups} />
          </section>

          <RecentCallsTable calls={data.recent_calls} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
