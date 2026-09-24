import type { FC } from "react";
import Link from "next/link";
import { AgentMark } from "@/components/ui/agent-mark";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { AgentStatusFormOptions } from "@/config/constants/dropdowns/analytics/agent-status-form.options";
import type { DashboardMostActiveAgent } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatNumber, formatPercent } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

interface MostActiveAgentsCardProps {
  agents: DashboardMostActiveAgent[];
}

export const MostActiveAgentsCard: FC<MostActiveAgentsCardProps> = ({ agents }) => (
  <SectionCard
    title="Most active agents"
    flush
    actions={
      <Link href={Routes.agents.root} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        All agents
      </Link>
    }
  >
    {agents.length === 0 ? (
      <p className="px-6 py-10 text-center text-sm text-muted-foreground">
        No agent has handled a call in this period yet.
      </p>
    ) : (
      <ul>
        {agents.map(({ agent, calls, success_rate }) => (
          <li key={agent.id} className="border-b border-border last:border-b-0">
            <Link
              href={Routes.agents.detail(agent.id)}
              className="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-muted/60"
            >
              <AgentMark seed={agent.id} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{agent.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {getDropdownOptionLabel(AgentStatusFormOptions, agent.status)}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-medium tabular-nums">
                  {formatNumber(calls)} {calls === 1 ? "call" : "calls"}
                </span>
                <span className="block text-sm text-muted-foreground tabular-nums">
                  {formatPercent(success_rate)} success
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
);
