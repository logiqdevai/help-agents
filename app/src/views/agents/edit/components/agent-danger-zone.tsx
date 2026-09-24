"use client";

import { useState, type FC } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SectionCard } from "@/components/ui/section-card";
import { useDeleteAgent, useDuplicateAgent } from "@/features/agents/hooks/use-agents";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { Routes } from "@/routes/routes";

/** Duplicate the agent, or delete it after a confirmation. */
export const AgentDangerZone: FC<{ agent: Agent }> = ({ agent }) => {
  const router = useRouter();
  const duplicate = useDuplicateAgent();
  const deleteAgent = useDeleteAgent();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <SectionCard title="Duplicate or delete" className="border-destructive/30">
      <div className="flex flex-col divide-y divide-border">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="max-w-xl">
            <p className="text-sm font-medium">Duplicate agent</p>
            <p className="text-sm text-muted-foreground">
              Makes a copy with the same behavior as a new draft. Phone numbers are not copied.
            </p>
          </div>
          <ActionButtonWithPending
            variant="outline"
            isPending={duplicate.isPending}
            onClick={() =>
              duplicate.mutate(agent.id, { onSuccess: (copy) => router.push(Routes.agents.detail(copy.id)) })
            }
          >
            <CopyIcon aria-hidden="true" />
            Duplicate
          </ActionButtonWithPending>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="max-w-xl">
            <p className="text-sm font-medium">Delete agent</p>
            <p className="text-sm text-muted-foreground">
              Removes this agent from your account. Its past calls and transcripts stay in your call history.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon aria-hidden="true" />
            Delete agent
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this agent?"
        description={`${agent.name} will stop making and receiving calls. Its phone numbers are unassigned and any pending scheduled calls are cancelled. Past calls stay in your call history.`}
        confirmLabel="Delete agent"
        isPending={deleteAgent.isPending}
        onConfirm={async () => {
          await deleteAgent.mutateAsync(agent.id);
          router.replace(Routes.agents.root);
        }}
      />
    </SectionCard>
  );
};
