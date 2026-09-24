"use client";

import type { FC } from "react";
import Link from "next/link";
import { BanIcon, BotIcon, CheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationAgentStatusOptions } from "@/config/constants/dropdowns/integrations/integration-agent-status.options";
import { useGetIntegrationCrmTools } from "@/features/integrations/hooks/use-crm-tools";
import { useGetIntegrationAgents } from "@/features/integrations/hooks/use-integrations";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const ToolChip: FC<{ label: string; allowed: boolean }> = ({ label, allowed }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
      allowed
        ? "border-border bg-secondary text-foreground"
        : "border-dashed border-border bg-transparent text-muted-foreground",
    )}
  >
    {allowed ? <CheckIcon className="size-3" aria-hidden="true" /> : <BanIcon className="size-3" aria-hidden="true" />}
    {label}
  </span>
);

export const AgentsTab: FC<{ integrationId: string; canEditAgents: boolean }> = ({ integrationId, canEditAgents }) => {
  const agents = useGetIntegrationAgents(integrationId);
  const tools = useGetIntegrationCrmTools(integrationId);

  if (agents.isPending || tools.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (agents.isError || tools.isError) {
    const failed = agents.isError ? agents : tools;
    return (
      <ErrorState
        title="Could not load the agents"
        message={failed.error?.message}
        onRetry={() => {
          void agents.refetch();
          void tools.refetch();
        }}
      />
    );
  }

  if (!agents.data.length) {
    return (
      <EmptyState
        icon={BotIcon}
        title="No agent uses this connection yet"
        description="Choose this CRM in an agent's settings, then tick the tools it may use."
        action={
          <Link href={Routes.agents.root} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Go to agents
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {agents.data.map((agent) => {
        const allowedIds = new Set(agent.allowed_tools.map((tool) => tool.id));
        const notAllowed = tools.data.filter((tool) => !allowedIds.has(tool.id));
        return (
          <Card key={agent.id}>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  <Link href={Routes.agents.detail(agent.id)} className="underline-offset-4 hover:underline">
                    {agent.name}
                  </Link>
                </CardTitle>
                <CardDescription className="mt-1">
                  {getDropdownOptionLabel(IntegrationAgentStatusOptions, agent.status)} · what it is allowed to do in
                  this CRM
                </CardDescription>
              </div>
              {canEditAgents ? (
                <Link href={Routes.agents.edit(agent.id)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Change tools
                </Link>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <div className="mb-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Allowed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.allowed_tools.length ? (
                    agent.allowed_tools.map((tool) => <ToolChip key={tool.id} label={tool.name} allowed />)
                  ) : (
                    <span className="text-sm text-muted-foreground">No tools allowed yet.</span>
                  )}
                </div>
              </div>
              {notAllowed.length ? (
                <div>
                  <div className="mb-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Not allowed
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {notAllowed.map((tool) => (
                      <ToolChip key={tool.id} label={tool.name} allowed={false} />
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
