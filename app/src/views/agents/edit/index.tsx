"use client";

import { useCallback, useState, type FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BotIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentEditTabOptions, type AgentEditTab } from "@/config/constants/dropdowns/agents/agent-edit-tab.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgent } from "@/features/agents/hooks/use-agents";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { CallDialog, CallDialogVariants } from "@/views/calls/components/call-dialog";
import { AccessTab } from "./components/access-tab";
import { AgentSyncNotice } from "./components/agent-sync-notice";
import { AutomationsTab } from "./components/automations-tab";
import { CrmTab } from "./components/crm-tab";
import { EditHeader } from "./components/edit-header";
import { GeneralTab } from "./components/general-tab";
import { GoalsTab } from "./components/goals-tab";
import { InstructionsTab } from "./components/instructions-tab";
import { KnowledgeTab } from "./components/knowledge-tab";
import { OutcomesTab } from "./components/outcomes-tab";
import { PhoneTab } from "./components/phone-tab";
import { RetriesTab } from "./components/retries-tab";
import { useBehaviorEditor } from "./hooks/use-behavior-editor";
import { useUnsavedChanges } from "./hooks/use-unsaved-changes";
import { TabSections } from "./types";

const isEditTab = (value: string | null): value is AgentEditTab =>
  AgentEditTabOptions.some((option) => option.id === value);

const AgentEditor: FC<{ agent: Agent; initialTab: AgentEditTab }> = ({ agent, initialTab }) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AgentEditTab>(initialTab);
  // Tabs load their data when first opened and then stay mounted, so edits survive switching tabs.
  const [visited, setVisited] = useState<ReadonlySet<AgentEditTab>>(new Set([initialTab]));
  const [testOpen, setTestOpen] = useState(false);
  const { dirtySections, hasUnsaved, setSectionDirty } = useUnsavedChanges();

  const showTab = useCallback((next: AgentEditTab) => {
    setTab(next);
    setVisited((current) => new Set(current).add(next));
  }, []);
  const behavior = useBehaviorEditor(agent, setSectionDirty, showTab);

  const renderTab = (id: AgentEditTab) => {
    switch (id) {
      case "general":
        return <GeneralTab agent={agent} setSectionDirty={setSectionDirty} onTest={() => setTestOpen(true)} />;
      case "instructions":
        return <InstructionsTab agent={agent} editor={behavior} />;
      case "goals":
        return <GoalsTab agent={agent} editor={behavior} />;
      case "outcomes":
        return <OutcomesTab agent={agent} editor={behavior} />;
      case "knowledge":
        return <KnowledgeTab agent={agent} setSectionDirty={setSectionDirty} />;
      case "crm":
        return <CrmTab agent={agent} setSectionDirty={setSectionDirty} />;
      case "phone":
        return <PhoneTab agent={agent} />;
      case "retries":
        return <RetriesTab agent={agent} setSectionDirty={setSectionDirty} />;
      case "automations":
        return <AutomationsTab agent={agent} />;
      case "access":
        return <AccessTab agent={agent} setSectionDirty={setSectionDirty} />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <EditHeader agent={agent} hasUnsaved={hasUnsaved} onTest={() => setTestOpen(true)} />
      <AgentSyncNotice agent={agent} />

      <Tabs value={tab} onValueChange={(value) => showTab(value as AgentEditTab)} className="gap-6">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" className="h-10 border-b border-border" aria-label="Agent settings">
            {AgentEditTabOptions.map((option) => {
              const section = TabSections[option.id];
              return (
                <TabsTrigger key={option.id} value={option.id} className="flex-none px-3">
                  {option.label}
                  {section && dirtySections.has(section) ? (
                    <span role="img" aria-label="Unsaved changes" className="size-1.5 rounded-full bg-foreground" />
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {AgentEditTabOptions.map((option) => (
          <TabsContent key={option.id} value={option.id} keepMounted>
            {visited.has(option.id) ? renderTab(option.id) : null}
          </TabsContent>
        ))}
      </Tabs>

      <CallDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        variant={CallDialogVariants.TEST}
        agentId={agent.id}
        onPlaced={() => queryClient.invalidateQueries({ queryKey: ["agent"] })}
      />
    </div>
  );
};

/** Loads the agent and lets people who may change agents edit every part of it. */
const AgentEditPage: FC<{ id: string }> = ({ id }) => {
  const { can } = usePermissions();
  const agent = useGetAgent(id);
  // Read once: the links from the agent page open the tab they are about.
  const params = useSearchParams();
  const [tabParam] = useState(() => params.get("tab"));

  if (!can(Permissions.AGENTS_WRITE)) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <EmptyState
          icon={BotIcon}
          title="You cannot edit agents"
          description="Ask an owner or admin of your company to give you access. You can still look at this agent."
          action={
            <Link href={Routes.agents.detail(id)} className={buttonVariants({ variant: "outline" })}>
              View the agent
            </Link>
          }
        />
      </div>
    );
  }

  // A failed refresh keeps the agent on screen, so edits in progress are not thrown away.
  if (!agent.data) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        {agent.isError ? (
          <ErrorState title="Could not load this agent" message={agent.error.message} onRetry={() => agent.refetch()} />
        ) : (
          <DetailSkeleton cards={2} withTable={false} />
        )}
      </div>
    );
  }

  return <AgentEditor agent={agent.data} initialTab={isEditTab(tabParam) ? tabParam : "general"} />;
};

export default AgentEditPage;
