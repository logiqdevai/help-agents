"use client";

import type { FC } from "react";
import Link from "next/link";
import { OutcomeBreakdownCard } from "@/components/ui/outcome-breakdown-card";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { AgentSetupStepOptions } from "@/config/constants/dropdowns/agents/agent-setup-step.options";
import type { Agent, AgentOverview } from "@/features/agents/interfaces/agents.interfaces";
import { formatDuration, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { AgentReadinessList } from "@/views/agents/components/agent-readiness-list";
import { getAgentSetupDetails } from "@/views/agents/utils/agent-setup-details";
import { RecentCallsTable } from "./recent-calls-table";
import { RetryRuleCard } from "./retry-rule-card";

const RECENT_CALLS = 5;

/** "+9% vs. yesterday" or a plain count when yesterday had no calls to compare with. */
function describeTodayChange(today: number, yesterday: number): string {
  if (yesterday === 0) return "No calls yesterday";
  const change = Math.round(((today - yesterday) / yesterday) * 100);
  return `${change > 0 ? "+" : ""}${change}% vs. yesterday`;
}

interface OverviewTabProps {
  agent: Agent;
  overview: AgentOverview;
  canEdit: boolean;
}

export const OverviewTab: FC<OverviewTabProps> = ({ agent, overview, canEdit }) => {
  const { readiness } = overview;
  const completed = AgentSetupStepOptions.filter((step) => readiness.steps[step.id].complete).length;
  const total = AgentSetupStepOptions.length;
  const month = overview.last_30_days;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Calls today"
          value={formatNumber(overview.calls_today)}
          note={describeTodayChange(overview.calls_today, overview.calls_yesterday)}
        />
        <StatCard
          label="Success rate · 30 days"
          value={formatPercent(month.success_rate)}
          note={`${formatNumber(month.successful_calls)} of ${formatNumber(month.total_calls)} calls`}
        />
        <StatCard
          label="Average duration"
          value={formatDuration(overview.average_duration_seconds)}
          note="Finished calls"
        />
        <StatCard
          label="Average cost"
          value={formatMoney(overview.average_cost, overview.currency)}
          note="Per call · AI + telephony"
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <OutcomeBreakdownCard
            title="Outcomes · last 30 days"
            summary={`${formatNumber(month.total_calls)} calls`}
            outcomes={overview.outcomes_30_days}
            emptyMessage="No calls in the last 30 days."
          />
          <section className="flex flex-col gap-3" aria-labelledby="recent-calls-heading">
            <div className="flex items-center justify-between gap-3">
              <h3 id="recent-calls-heading" className="text-base font-medium">
                Recent calls
              </h3>
              <Link href={Routes.calls.root} className="text-sm underline underline-offset-4">
                All calls
              </Link>
            </div>
            <RecentCallsTable agentId={agent.id} limit={RECENT_CALLS} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="Ready to go live"
            actions={
              <span className="text-sm text-muted-foreground tabular-nums">
                {completed} of {total}
              </span>
            }
          >
            <Progress value={(completed / total) * 100} aria-label="Setup progress" className="mb-5" />
            <AgentReadinessList readiness={readiness} details={getAgentSetupDetails(agent, overview)} />
          </SectionCard>
          <RetryRuleCard agentId={agent.id} canEdit={canEdit} />
        </div>
      </div>
    </div>
  );
};
