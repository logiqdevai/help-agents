"use client";

import type { FC } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { RetryTriggerFormOptions } from "@/config/constants/dropdowns/agents/retry-trigger-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgentRetryRule } from "@/features/agents/hooks/use-agents";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { formatDelays } from "@/views/agents/utils/retry-format";

const Row: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd>{children}</dd>
  </div>
);

/** Whether and how the platform tries again after a call that did not go through. */
export const RetryRuleCard: FC<{ agentId: string; canEdit: boolean }> = ({ agentId, canEdit }) => {
  const { can } = usePermissions();
  const rule = useGetAgentRetryRule(agentId, can(Permissions.SCHEDULING_READ));

  return (
    <SectionCard
      title="Retry & follow-up rules"
      actions={
        canEdit ? (
          <Link href={Routes.agents.edit(agentId, "retries")} className="text-sm underline underline-offset-4">
            Edit
          </Link>
        ) : undefined
      }
    >
      {!can(Permissions.SCHEDULING_READ) ? (
        <p className="text-sm text-muted-foreground">You do not have access to scheduling rules.</p>
      ) : rule.isPending ? (
        <Skeleton className="h-24 w-full" />
      ) : rule.isError ? (
        <ErrorState title="Could not load the retry rule" message={rule.error.message} onRetry={() => rule.refetch()} />
      ) : !rule.data.configured || !rule.data.is_enabled ? (
        <p className="text-sm text-muted-foreground">
          Retries are off. Calls that are not answered are not tried again.
        </p>
      ) : (
        <dl className="flex flex-col gap-3 text-sm">
          <Row label="Retry when">
            {rule.data.retry_on.map((trigger) => getDropdownOptionLabel(RetryTriggerFormOptions, trigger)).join(", ")}
          </Row>
          <Row label="Attempts">Up to {rule.data.max_attempts}</Row>
          <Row label="Delays">{formatDelays(rule.data.delays_minutes)}</Row>
          <Row label="Calling hours">
            {rule.data.calling_hours_override ? "Hours set for this agent" : "Company calling hours"}
          </Row>
        </dl>
      )}
    </SectionCard>
  );
};
