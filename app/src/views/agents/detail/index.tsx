"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgent, useGetAgentOverview, useResyncAgent } from "@/features/agents/hooks/use-agents";
import { AgentStatuses } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { AgentHeader } from "./components/agent-header";
import { BehaviorTab } from "./components/behavior-tab";
import { CallsTab } from "./components/calls-tab";
import { CrmTab } from "./components/crm-tab";
import { GlanceTiles } from "./components/glance-tiles";
import { KnowledgeTab } from "./components/knowledge-tab";
import { OverviewTab } from "./components/overview-tab";

const DetailTabs = {
  OVERVIEW: "overview",
  BEHAVIOR: "behavior",
  KNOWLEDGE: "knowledge",
  CRM: "crm",
  CALLS: "calls",
} as const;
type DetailTab = (typeof DetailTabs)[keyof typeof DetailTabs];

const AgentDetailPage: FC<{ id: string }> = ({ id }) => {
  const { can } = usePermissions();
  const canEdit = can(Permissions.AGENTS_WRITE);
  const agent = useGetAgent(id);
  const overview = useGetAgentOverview(id);
  const resync = useResyncAgent();
  const [tab, setTab] = useState<DetailTab>(DetailTabs.OVERVIEW);

  if (agent.isPending || overview.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <DetailSkeleton cards={4} withTable />
      </div>
    );
  }

  if (agent.isError || overview.isError) {
    const failed = agent.isError ? agent : overview;
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState
          title="Could not load this agent"
          message={failed.error?.message}
          onRetry={() => {
            void agent.refetch();
            void overview.refetch();
          }}
        />
      </div>
    );
  }

  const config = agent.data;
  const stats = overview.data;
  const isDraft = config.status === AgentStatuses.DRAFT;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AgentHeader agent={config} />

      {stats.unresolved_alerts > 0 ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>The latest changes could not be applied yet</AlertTitle>
          <AlertDescription>
            The service that runs the agent is temporarily unavailable. Calls keep using the previous setup until this
            succeeds.
          </AlertDescription>
          {canEdit ? (
            <AlertAction>
              <ActionButtonWithPending
                variant="outline"
                size="sm"
                isPending={resync.isPending}
                onClick={() => resync.mutate(id)}
              >
                Try again
              </ActionButtonWithPending>
            </AlertAction>
          ) : null}
        </Alert>
      ) : null}

      {isDraft ? (
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>This agent is still a draft</AlertTitle>
          <AlertDescription>
            It cannot make or receive calls until setup is finished and it is activated.
          </AlertDescription>
          {canEdit ? (
            <AlertAction>
              <Link href={Routes.agents.resume(id)} className="text-sm font-medium underline underline-offset-4">
                Continue setup
              </Link>
            </AlertAction>
          ) : null}
        </Alert>
      ) : null}

      <GlanceTiles agent={config} overview={stats} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)} className="gap-6">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" className="h-10 border-b border-border">
            <TabsTrigger value={DetailTabs.OVERVIEW} className="flex-none px-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value={DetailTabs.BEHAVIOR} className="flex-none px-3">
              Behavior
            </TabsTrigger>
            <TabsTrigger value={DetailTabs.KNOWLEDGE} className="flex-none px-3">
              Knowledge
              {config.knowledge_sources.length > 0 ? (
                <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">
                  {config.knowledge_sources.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value={DetailTabs.CRM} className="flex-none px-3">
              CRM
            </TabsTrigger>
            <TabsTrigger value={DetailTabs.CALLS} className="flex-none px-3">
              Calls
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={DetailTabs.OVERVIEW}>
          <OverviewTab agent={config} overview={stats} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value={DetailTabs.BEHAVIOR}>
          <BehaviorTab agent={config} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value={DetailTabs.KNOWLEDGE}>
          <KnowledgeTab agent={config} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value={DetailTabs.CRM}>
          <CrmTab agent={config} />
        </TabsContent>
        <TabsContent value={DetailTabs.CALLS}>
          <CallsTab agentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDetailPage;
