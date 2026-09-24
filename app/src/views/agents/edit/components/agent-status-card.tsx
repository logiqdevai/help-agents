"use client";

import type { FC } from "react";
import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useActivateAgent, useDeactivateAgent } from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import { Routes } from "@/routes/routes";
import { AgentStatusBadge } from "@/views/agents/components/agent-status-badge";

/** Turns the agent on or off. A draft has to finish setup first, so it links to the setup instead. */
export const AgentStatusCard: FC<{ agent: Agent }> = ({ agent }) => {
  const activate = useActivateAgent();
  const deactivate = useDeactivateAgent();
  const isDraft = agent.status === AgentStatuses.DRAFT;
  const isActive = agent.status === AgentStatuses.ACTIVE;
  const isSwitching = activate.isPending || deactivate.isPending;

  return (
    <SectionCard
      title="Status"
      description="Inactive agents do not place or receive calls."
      actions={<AgentStatusBadge status={agent.status} />}
    >
      {isDraft ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted-foreground">
            This agent is still a draft. Finish the setup steps to turn it on.
          </p>
          <Link href={Routes.agents.resume(agent.id)} className={buttonVariants({ variant: "outline" })}>
            <PlayIcon aria-hidden="true" />
            Continue setup
          </Link>
        </div>
      ) : (
        <label className="flex items-start gap-3">
          {isSwitching ? (
            <Spinner className="mt-0.5 size-5" />
          ) : (
            <Switch
              className="mt-0.5"
              checked={isActive}
              onCheckedChange={(next) => (next ? activate.mutate(agent.id) : deactivate.mutate(agent.id))}
            />
          )}
          <span>
            <span className="block text-sm font-medium">{isActive ? "The agent is on" : "The agent is off"}</span>
            <span className="block text-sm text-muted-foreground">
              {isActive
                ? "It makes and receives calls. Turn it off to pause it without losing any settings."
                : "Turn it on when you are ready. It needs an active phone number first."}
            </span>
          </span>
        </label>
      )}
    </SectionCard>
  );
};
