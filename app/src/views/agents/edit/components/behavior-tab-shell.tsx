"use client";

import type { FC, ReactNode } from "react";
import { Form } from "@/components/ui/form";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import type { BehaviorEditor } from "../hooks/use-behavior-editor";
import { EditSaveBar } from "./edit-save-bar";

interface BehaviorTabShellProps {
  agent: Agent;
  editor: BehaviorEditor;
  children: ReactNode;
}

/** Wraps a behavior tab in the shared behavior form and its save bar; one save covers all three tabs. */
export const BehaviorTabShell: FC<BehaviorTabShellProps> = ({ agent, editor, children }) => (
  <div className="flex flex-col gap-6">
    <Form {...editor.form}>
      <form onSubmit={editor.save} noValidate className="flex flex-col gap-6">
        {children}
      </form>
    </Form>
    <EditSaveBar
      isDirty={editor.isDirty}
      isPending={editor.isPending}
      isLive={agent.status === AgentStatuses.ACTIVE}
      onSave={() => void editor.save()}
      onDiscard={editor.discard}
    />
  </div>
);
