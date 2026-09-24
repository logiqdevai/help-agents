"use client";

import { useState, type FC } from "react";
import { InfoIcon } from "lucide-react";
import { useReplaceAgentKnowledgeSources } from "@/features/agents/hooks/use-agents";
import { AgentSetupSteps } from "@/features/agents/interfaces/agents.interfaces";
import { KnowledgeSourcePicker } from "@/views/agents/components/knowledge-source-picker";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

export const KnowledgeStep: FC<WizardStepProps> = ({ agent, onBack, onNext }) => {
  const replaceSources = useReplaceAgentKnowledgeSources();
  const saved = agent.knowledge_sources.map((source) => source.id);
  const [selected, setSelected] = useState<string[]>(saved);
  const isDirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));

  const save = (advance: boolean) => {
    if (!isDirty) {
      if (advance) onNext();
      return;
    }
    replaceSources.mutate({ id: agent.id, sourceIds: selected }, { onSuccess: () => advance && onNext() });
  };

  return (
    <>
      <StepShell step={AgentSetupSteps.KNOWLEDGE}>
        <KnowledgeSourcePicker value={selected} onChange={setSelected} />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p>
            Agents never invent answers. If something isn&apos;t in the selected sources or the instructions, the agent
            says a team member will get back to the customer.
          </p>
        </div>
      </StepShell>
      <WizardFooter
        onBack={onBack}
        onSaveDraft={isDirty ? () => save(false) : undefined}
        onContinue={() => save(true)}
        isPending={replaceSources.isPending}
      />
    </>
  );
};
