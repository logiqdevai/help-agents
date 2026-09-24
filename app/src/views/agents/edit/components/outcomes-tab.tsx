"use client";

import type { FC } from "react";
import { SectionCard } from "@/components/ui/section-card";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { AgentOutcomeFields } from "@/views/agents/components/agent-outcome-fields";
import { AgentTransferFields } from "@/views/agents/components/agent-transfer-fields";
import { AgentVoicemailFields } from "@/views/agents/components/agent-voicemail-fields";
import type { BehaviorEditor } from "../hooks/use-behavior-editor";
import { BehaviorTabShell } from "./behavior-tab-shell";

export const OutcomesTab: FC<{ agent: Agent; editor: BehaviorEditor }> = ({ agent, editor }) => (
  <BehaviorTabShell agent={agent} editor={editor}>
    <SectionCard
      title="Call outcomes"
      description="Every call ends with one of these. Success outcomes count toward the success rate of this agent."
      footer="Actions that follow an outcome are set up under Automations."
    >
      <AgentOutcomeFields form={editor.form} />
    </SectionCard>
    <SectionCard title="Voicemail" description="The platform recognises answering machines so they are logged accurately.">
      <AgentVoicemailFields form={editor.form} />
    </SectionCard>
    <SectionCard title="Talk to a human" description="Hand the live call to your team when needed.">
      <AgentTransferFields form={editor.form} />
    </SectionCard>
  </BehaviorTabShell>
);
