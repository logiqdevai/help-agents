"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgentCrmTools, useReplaceAgentCrmTools, useUpdateAgent } from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { CrmConnectionPicker } from "@/views/agents/components/crm-connection-picker";
import { CrmToolsPicker } from "@/views/agents/components/crm-tools-picker";
import { FieldMappingTab } from "@/views/integrations/detail/components/field-mapping-tab";
import { useReportDirty } from "../hooks/use-unsaved-changes";
import { EditSections, type SetSectionDirty } from "../types";
import { EditSaveBar } from "./edit-save-bar";

interface CrmTabProps {
  agent: Agent;
  setSectionDirty: SetSectionDirty;
}

export const CrmTab: FC<CrmTabProps> = ({ agent, setSectionDirty }) => {
  const { can } = usePermissions();
  const updateAgent = useUpdateAgent();
  const replaceTools = useReplaceAgentCrmTools();
  const integration = agent.crm_integration;
  const tools = useGetAgentCrmTools(agent.id, !!integration);
  // Undefined until a switch is changed; until then the saved choice from the API is shown.
  const [edited, setEdited] = useState<string[] | undefined>(undefined);
  const savedIds = tools.data?.data.filter((tool) => tool.allowed).map((tool) => tool.id) ?? [];
  const allowedIds = edited ?? savedIds;
  const isDirty =
    edited !== undefined &&
    (edited.length !== savedIds.length || edited.some((toolId) => !savedIds.includes(toolId)));
  useReportDirty(EditSections.CRM, isDirty, setSectionDirty);

  // The actions on offer belong to the connection, so the connection is saved as soon as it is chosen.
  const chooseConnection = (integrationId: string | null) => {
    if (integrationId === agent.crm_integration_uuid) return;
    updateAgent.mutate(
      { id: agent.id, dto: { crm_integration_uuid: integrationId } },
      { onSuccess: () => setEdited(undefined) },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="CRM connection"
        description="Where this agent looks up and updates records. The connection is saved as soon as you choose it."
        actions={
          integration ? (
            <Link href={Routes.integrations.detail(integration.id)} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Manage connection
            </Link>
          ) : undefined
        }
      >
        <CrmConnectionPicker
          value={agent.crm_integration_uuid}
          onChange={chooseConnection}
          disabled={updateAgent.isPending}
        />
      </SectionCard>

      {integration ? (
        <>
          <SectionCard
            title={`What this agent is allowed to do in ${integration.name}`}
            description="Nothing is allowed unless you switch it on. The agent can only request an action. The platform checks it before anything happens."
          >
            {tools.isPending ? (
              <div className="flex flex-col gap-3" aria-busy="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : tools.isError ? (
              <ErrorState
                title="Could not load the CRM actions"
                message={tools.error.message}
                onRetry={() => tools.refetch()}
              />
            ) : (
              <CrmToolsPicker tools={tools.data.data} value={allowedIds} onChange={setEdited} />
            )}
          </SectionCard>

          <FieldMappingTab
            integrationId={integration.id}
            integrationName={integration.name}
            canManage={can(Permissions.INTEGRATIONS_MANAGE)}
            agentId={agent.id}
          />
        </>
      ) : null}

      <EditSaveBar
        isDirty={isDirty}
        isPending={replaceTools.isPending}
        isLive={agent.status === AgentStatuses.ACTIVE}
        onSave={() =>
          replaceTools.mutate({ id: agent.id, toolIds: allowedIds }, { onSuccess: () => setEdited(undefined) })
        }
        onDiscard={() => setEdited(undefined)}
      />
    </div>
  );
};
