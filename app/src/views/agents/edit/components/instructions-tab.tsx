"use client";

import type { FC } from "react";
import { OrbCard, OrbTones } from "@/components/ui/orb-card";
import { SectionCard } from "@/components/ui/section-card";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { AgentInstructionsField } from "@/views/agents/components/agent-instructions-field";
import type { BehaviorEditor } from "../hooks/use-behavior-editor";
import { BehaviorTabShell } from "./behavior-tab-shell";
import { InstructionVariableChips } from "./instruction-variable-chips";

export const InstructionsTab: FC<{ agent: Agent; editor: BehaviorEditor }> = ({ agent, editor }) => (
  <BehaviorTabShell agent={agent} editor={editor}>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <SectionCard
        title="Instructions"
        description="Describe in plain language how the agent should behave on a call."
      >
        <div className="flex flex-col gap-6">
          <AgentInstructionsField form={editor.form} />
          <InstructionVariableChips agent={agent} form={editor.form} />
        </div>
      </SectionCard>

      <div className="flex flex-col gap-6">
        <OrbCard orbs={[{ tone: OrbTones.LAVENDER, className: "size-56 -top-16 -right-12" }]}>
          <h3 className="text-base font-medium">The platform does the rest</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You describe the behavior once. The platform turns it into everything needed to run the call, so you never
            have to deal with the technical side.
          </p>
        </OrbCard>
        <SectionCard title="Tips">
          <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
            <li>
              Say what the agent should <strong className="font-medium text-foreground">never</strong> do.
            </li>
            <li>Use goals and questions for what it must find out. They make results more predictable.</li>
            <li>Test after each change before going live.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  </BehaviorTabShell>
);
