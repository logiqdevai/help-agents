"use client";

import type { FC } from "react";
import { SectionCard } from "@/components/ui/section-card";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { AgentGoalFields } from "@/views/agents/components/agent-goal-fields";
import { AgentQuestionFields } from "@/views/agents/components/agent-question-fields";
import { AgentSuccessFields } from "@/views/agents/components/agent-success-fields";
import type { BehaviorEditor } from "../hooks/use-behavior-editor";
import { BehaviorTabShell } from "./behavior-tab-shell";

export const GoalsTab: FC<{ agent: Agent; editor: BehaviorEditor }> = ({ agent, editor }) => (
  <BehaviorTabShell agent={agent} editor={editor}>
    <SectionCard title="Goal" description="What this agent is trying to achieve, and what to find out on every call.">
      <AgentGoalFields form={editor.form} />
    </SectionCard>
    <SectionCard
      title="Success"
      description="How a successful call is told apart from one that was not, and how long a call may last."
    >
      <AgentSuccessFields form={editor.form} />
    </SectionCard>
    <SectionCard
      title="Questions"
      description="Worked naturally into the conversation, not a rigid script and not in a fixed order."
    >
      <AgentQuestionFields form={editor.form} />
    </SectionCard>
  </BehaviorTabShell>
);
