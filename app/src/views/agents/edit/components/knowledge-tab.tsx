"use client";

import { useState, type FC } from "react";
import { InfoIcon } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { useReplaceAgentKnowledgeSources } from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import { KnowledgeSourcePicker } from "@/views/agents/components/knowledge-source-picker";
import { useReportDirty } from "../hooks/use-unsaved-changes";
import { EditSections, type SetSectionDirty } from "../types";
import { EditSaveBar } from "./edit-save-bar";

interface KnowledgeTabProps {
  agent: Agent;
  setSectionDirty: SetSectionDirty;
}

export const KnowledgeTab: FC<KnowledgeTabProps> = ({ agent, setSectionDirty }) => {
  const replaceSources = useReplaceAgentKnowledgeSources();
  const saved = agent.knowledge_sources.map((source) => source.id);
  const [selected, setSelected] = useState<string[]>(saved);
  const isDirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));
  useReportDirty(EditSections.KNOWLEDGE, isDirty, setSectionDirty);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Knowledge this agent can use"
        description={`The agent searches these sources live while talking to customers. ${selected.length} attached.`}
      >
        <KnowledgeSourcePicker value={selected} onChange={setSelected} />
      </SectionCard>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p>
          Agents never invent answers. If something is not in the selected sources or the instructions, the agent says a
          team member will get back to the customer.
        </p>
      </div>
      <EditSaveBar
        isDirty={isDirty}
        isPending={replaceSources.isPending}
        isLive={agent.status === AgentStatuses.ACTIVE}
        onSave={() => replaceSources.mutate({ id: agent.id, sourceIds: selected })}
        onDiscard={() => setSelected(saved)}
      />
    </div>
  );
};
