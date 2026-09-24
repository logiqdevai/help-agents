"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConicalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SectionCard } from "@/components/ui/section-card";
import { Permissions } from "@/config/constants/permissions";
import { useUpdateAgent } from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import { toBasicsDto, toBasicsFormValues } from "@/features/agents/utils/agent-payload.utils";
import { agentBasicsSchema, type AgentBasicsFormData } from "@/features/agents/validation-schemas/agents.schema";
import { usePermissions } from "@/hooks/use-permissions";
import { AgentBasicsFields } from "@/views/agents/components/agent-basics-fields";
import { AgentTestCalls } from "@/views/agents/components/agent-test-calls";
import { AgentVoiceFields } from "@/views/agents/components/agent-voice-fields";
import { useReportDirty } from "../hooks/use-unsaved-changes";
import { EditSections, type SetSectionDirty } from "../types";
import { AgentDangerZone } from "./agent-danger-zone";
import { AgentStatusCard } from "./agent-status-card";
import { EditSaveBar } from "./edit-save-bar";

interface GeneralTabProps {
  agent: Agent;
  setSectionDirty: SetSectionDirty;
  onTest: () => void;
}

export const GeneralTab: FC<GeneralTabProps> = ({ agent, setSectionDirty, onTest }) => {
  const { can } = usePermissions();
  const updateAgent = useUpdateAgent();
  const form = useForm<AgentBasicsFormData>({
    resolver: zodResolver(agentBasicsSchema),
    defaultValues: toBasicsFormValues(agent),
  });
  useReportDirty(EditSections.BASICS, form.formState.isDirty, setSectionDirty);

  const save = form.handleSubmit((values) =>
    updateAgent.mutate(
      { id: agent.id, dto: toBasicsDto(values) },
      { onSuccess: (saved) => form.reset(toBasicsFormValues(saved)) },
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={save} noValidate className="flex flex-col gap-6">
          <SectionCard title="Basics" description="What this agent is called and what it is for.">
            <AgentBasicsFields form={form} />
          </SectionCard>
          <SectionCard title="Voice and language" description="How the agent sounds on the phone.">
            <AgentVoiceFields form={form} />
          </SectionCard>
        </form>
      </Form>

      <AgentStatusCard agent={agent} />

      <SectionCard
        title="Test calls"
        description="Place a real test call to try the conversation out. Test calls are marked as tests in Calls."
        actions={
          can(Permissions.CALLS_PLACE) ? (
            <Button variant="outline" size="sm" onClick={onTest}>
              <FlaskConicalIcon aria-hidden="true" />
              Place a test call
            </Button>
          ) : undefined
        }
      >
        <AgentTestCalls agentId={agent.id} />
      </SectionCard>

      <AgentDangerZone agent={agent} />

      <EditSaveBar
        isDirty={form.formState.isDirty}
        isPending={updateAgent.isPending}
        isLive={agent.status === AgentStatuses.ACTIVE}
        onSave={() => void save()}
        onDiscard={() => form.reset(toBasicsFormValues(agent))}
      />
    </div>
  );
};
