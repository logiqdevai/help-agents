"use client";

import type { FC } from "react";
import { useState } from "react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReplaceKnowledgeAgents } from "@/features/knowledge/hooks/use-knowledge";
import type { KnowledgeSourceDetail } from "@/features/knowledge/interfaces/knowledge.interfaces";
import { AgentPicker } from "../../components/agent-picker";

interface ManageAgentsFormProps {
  source: KnowledgeSourceDetail;
  onDone: () => void;
}

const ManageAgentsForm: FC<ManageAgentsFormProps> = ({ source, onDone }) => {
  const replaceAgents = useReplaceKnowledgeAgents();
  const [agentIds, setAgentIds] = useState(() => source.used_by.map((agent) => agent.id));

  return (
    <>
      <div className="max-h-[50vh] overflow-y-auto">
        <AgentPicker value={agentIds} onChange={setAgentIds} disabled={replaceAgents.isPending} />
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <ActionButtonWithPending
          isPending={replaceAgents.isPending}
          onClick={() => replaceAgents.mutate({ id: source.id, agent_uuids: agentIds }, { onSuccess: onDone })}
        >
          Save
        </ActionButtonWithPending>
      </DialogFooter>
    </>
  );
};

interface ManageAgentsDialogProps {
  source: KnowledgeSourceDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageAgentsDialog: FC<ManageAgentsDialogProps> = ({ source, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg">Who can use it?</DialogTitle>
        <DialogDescription>Pick the agents that should draw on {source.name}.</DialogDescription>
      </DialogHeader>
      <ManageAgentsForm source={source} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
