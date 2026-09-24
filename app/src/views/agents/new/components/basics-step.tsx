"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useCreateAgent, useUpdateAgent } from "@/features/agents/hooks/use-agents";
import { AgentSetupSteps, type Agent, type AgentTemplate } from "@/features/agents/interfaces/agents.interfaces";
import { toBasicsDto, toBasicsFormValues } from "@/features/agents/utils/agent-payload.utils";
import { agentBasicsSchema, type AgentBasicsFormData } from "@/features/agents/validation-schemas/agents.schema";
import { AgentBasicsFields } from "@/views/agents/components/agent-basics-fields";
import { AgentFormSection } from "@/views/agents/components/agent-form-section";
import { AgentVoiceFields } from "@/views/agents/components/agent-voice-fields";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

interface BasicsStepProps {
  /** Undefined until the first save creates the draft. */
  agent: Agent | undefined;
  template: AgentTemplate | undefined;
  /** Called after every save with the saved agent; `advance` is true when the user chose Continue. */
  onSaved: (agent: Agent, advance: boolean) => void;
}

export const BasicsStep: FC<BasicsStepProps> = ({ agent, template, onSaved }) => {
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const isPending = createAgent.isPending || updateAgent.isPending;

  const form = useForm<AgentBasicsFormData>({
    resolver: zodResolver(agentBasicsSchema),
    defaultValues: toBasicsFormValues(agent, template),
  });

  const save = (advance: boolean) =>
    form.handleSubmit((values) => {
      const dto = toBasicsDto(values);
      if (agent) {
        updateAgent.mutate({ id: agent.id, dto }, { onSuccess: (saved) => onSaved(saved, advance) });
      } else {
        createAgent.mutate(dto, { onSuccess: (created) => onSaved(created, advance) });
      }
    });

  return (
    <Form {...form}>
      <form onSubmit={save(true)} noValidate>
        <StepShell step={AgentSetupSteps.BASICS}>
          <AgentBasicsFields form={form} />
          <AgentFormSection title="Voice and language">
            <AgentVoiceFields form={form} />
          </AgentFormSection>
        </StepShell>
        <WizardFooter onSaveDraft={save(false)} isPending={isPending} />
      </form>
    </Form>
  );
};
