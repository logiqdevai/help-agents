"use client";

import { useState, type FC } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgentCrmTools, useReplaceAgentCrmTools, useUpdateAgent } from "@/features/agents/hooks/use-agents";
import { AgentSetupSteps } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { AgentFormSection } from "@/views/agents/components/agent-form-section";
import { CrmConnectionPicker } from "@/views/agents/components/crm-connection-picker";
import { CrmToolsPicker } from "@/views/agents/components/crm-tools-picker";
import { FieldMappingTab } from "@/views/integrations/detail/components/field-mapping-tab";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

export const CrmStep: FC<WizardStepProps> = ({ agent, onBack, onNext }) => {
  const { can } = usePermissions();
  const updateAgent = useUpdateAgent();
  const replaceTools = useReplaceAgentCrmTools();
  const integration = agent.crm_integration;
  const tools = useGetAgentCrmTools(agent.id, !!integration);
  // Undefined until the user changes a switch; until then the saved choice from the API is shown.
  const [edited, setEdited] = useState<string[] | undefined>(undefined);
  const allowedIds = edited ?? tools.data?.data.filter((tool) => tool.allowed).map((tool) => tool.id) ?? [];

  // The actions on offer belong to the connection, so the choice is saved as soon as it is made.
  const chooseConnection = (integrationId: string | null) => {
    if (integrationId === agent.crm_integration_uuid) return;
    updateAgent.mutate(
      { id: agent.id, dto: { crm_integration_uuid: integrationId } },
      { onSuccess: () => setEdited(undefined) },
    );
  };

  const save = (advance: boolean) => {
    if (edited === undefined) {
      if (advance) onNext();
      return;
    }
    replaceTools.mutate(
      { id: agent.id, toolIds: edited },
      {
        onSuccess: () => {
          setEdited(undefined);
          if (advance) onNext();
        },
      },
    );
  };

  return (
    <>
      <StepShell step={AgentSetupSteps.CRM}>
        <AgentFormSection title="Connection">
          <CrmConnectionPicker
            value={agent.crm_integration_uuid}
            onChange={chooseConnection}
            disabled={updateAgent.isPending}
          />
        </AgentFormSection>

        {integration ? (
          <>
            <AgentFormSection title={`What this agent can do in ${integration.name}`}>
              <p className="-mt-2 text-sm text-muted-foreground">
                This list comes from your CRM connection. Switch on only what the agent needs.
              </p>
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
            </AgentFormSection>

            <AgentFormSection title="Match fields" hint="Saved for this agent, on top of the connection's mapping">
              <FieldMappingTab
                integrationId={integration.id}
                integrationName={integration.name}
                canManage={can(Permissions.INTEGRATIONS_MANAGE)}
                agentId={agent.id}
              />
            </AgentFormSection>
          </>
        ) : null}
      </StepShell>
      <WizardFooter
        onBack={onBack}
        onSaveDraft={edited === undefined ? undefined : () => save(false)}
        onContinue={() => save(true)}
        isPending={replaceTools.isPending}
        disabled={updateAgent.isPending}
      />
    </>
  );
};
