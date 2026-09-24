"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useSaveAgentBehavior } from "@/features/agents/hooks/use-agents";
import { AgentSetupSteps, type AgentTemplate } from "@/features/agents/interfaces/agents.interfaces";
import { toBehaviorFormValues, toSaveBehaviorInput } from "@/features/agents/utils/agent-payload.utils";
import { agentBehaviorSchema, type AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { AgentFormSection } from "@/views/agents/components/agent-form-section";
import { AgentGoalFields } from "@/views/agents/components/agent-goal-fields";
import { AgentInstructionsField } from "@/views/agents/components/agent-instructions-field";
import { AgentOutcomeFields } from "@/views/agents/components/agent-outcome-fields";
import { AgentQuestionFields } from "@/views/agents/components/agent-question-fields";
import { AgentSuccessFields } from "@/views/agents/components/agent-success-fields";
import { AgentTransferFields } from "@/views/agents/components/agent-transfer-fields";
import { AgentVoicemailFields } from "@/views/agents/components/agent-voicemail-fields";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

interface BehaviorStepProps extends WizardStepProps {
  template: AgentTemplate | undefined;
}

export const BehaviorStep: FC<BehaviorStepProps> = ({ agent, template, onBack, onNext }) => {
  const saveBehavior = useSaveAgentBehavior();

  const form = useForm<AgentBehaviorFormData>({
    resolver: zodResolver(agentBehaviorSchema),
    defaultValues: toBehaviorFormValues(agent, template),
  });

  const save = (advance: boolean) =>
    form.handleSubmit((values) =>
      saveBehavior.mutate(toSaveBehaviorInput(agent.id, values), {
        onSuccess: (saved) => {
          // Rows created by this save now have ids; without them another save would replace instead of update.
          form.reset(toBehaviorFormValues(saved));
          if (advance) onNext();
        },
      }),
    );

  return (
    <Form {...form}>
      <form onSubmit={save(true)} noValidate>
        <StepShell step={AgentSetupSteps.BEHAVIOR}>
          <AgentFormSection title="Instructions" hint="Plain language">
            <AgentInstructionsField form={form} />
          </AgentFormSection>
          <AgentFormSection title="Goal" hint="A checklist of what the agent must come away with">
            <AgentGoalFields form={form} />
          </AgentFormSection>
          <AgentFormSection title="Questions" hint="Worked into the conversation, not asked in rigid order">
            <AgentQuestionFields form={form} />
          </AgentFormSection>
          <AgentFormSection title="Possible outcomes" hint="Every call ends with exactly one">
            <AgentOutcomeFields form={form} />
            <AgentSuccessFields form={form} />
          </AgentFormSection>
          <AgentFormSection title="Voicemail">
            <AgentVoicemailFields form={form} />
          </AgentFormSection>
          <AgentFormSection title="Talking to a human">
            <AgentTransferFields form={form} />
          </AgentFormSection>
        </StepShell>
        <WizardFooter onBack={onBack} onSaveDraft={save(false)} isPending={saveBehavior.isPending} />
      </form>
    </Form>
  );
};
