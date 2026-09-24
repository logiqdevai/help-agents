"use client";

import type { FC } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgentRetryRule } from "@/features/agents/hooks/use-agents";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { useGetCallingHours } from "@/features/company/hooks/use-company";
import { usePermissions } from "@/hooks/use-permissions";
import type { SetSectionDirty } from "../types";
import { RetryRuleEditor } from "./retry-rule-editor";

export const RetriesTab: FC<{ agent: Agent; setSectionDirty: SetSectionDirty }> = ({ agent, setSectionDirty }) => {
  const { can } = usePermissions();
  const canRead = can(Permissions.SCHEDULING_READ);
  const rule = useGetAgentRetryRule(agent.id, canRead);
  const companyHours = useGetCallingHours();

  if (!canRead) {
    return <p className="text-sm text-muted-foreground">You do not have access to scheduling rules.</p>;
  }

  // The company hours only add context and seed the custom hours, so a failure there does not block the rule.
  if (rule.isPending || companyHours.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]" aria-busy="true">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (rule.isError) {
    return <ErrorState title="Could not load the retry rule" message={rule.error.message} onRetry={() => rule.refetch()} />;
  }

  return (
    <RetryRuleEditor
      agentId={agent.id}
      rule={rule.data}
      companyHours={companyHours.data}
      canManage={can(Permissions.SCHEDULING_MANAGE)}
      setSectionDirty={setSectionDirty}
    />
  );
};
