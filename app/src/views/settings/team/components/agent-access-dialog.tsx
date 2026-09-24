"use client";

import type { FC } from "react";
import { useState } from "react";
import { BotIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentAccessStatusOptions } from "@/config/constants/dropdowns/users/agent-access-status.options";
import {
  useGetAgentOptions,
  useGetMemberAgentAccess,
  useSetMemberAgentAccess,
} from "@/features/team/hooks/use-team";
import type { TeamMember } from "@/features/team/interfaces/team.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

interface AgentAccessDialogProps {
  member: TeamMember | null;
  onClose: () => void;
}

const AgentAccessList: FC<{ member: TeamMember; onClose: () => void }> = ({ member, onClose }) => {
  const agents = useGetAgentOptions();
  const access = useGetMemberAgentAccess(member.id);
  const setAccess = useSetMemberAgentAccess();
  // null = untouched, so the checkboxes mirror the saved grants until the admin changes something.
  const [selected, setSelected] = useState<Set<string> | null>(null);

  if (agents.isPending || access.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (agents.isError || access.isError) {
    const error = agents.error ?? access.error;
    return (
      <ErrorState
        title="Could not load agent access"
        message={error?.message}
        onRetry={() => {
          if (agents.isError) agents.refetch();
          if (access.isError) access.refetch();
        }}
      />
    );
  }

  if (agents.data.length === 0) {
    return (
      <EmptyState
        icon={BotIcon}
        title="No agents yet"
        description="Create an agent first, then choose who can use it."
      />
    );
  }

  const current = selected ?? new Set(access.data.agents.map((agent) => agent.id));

  const toggle = (agentId: string, checked: boolean) => {
    const next = new Set(current);
    if (checked) next.add(agentId);
    else next.delete(agentId);
    setSelected(next);
  };

  return (
    <>
      <ul className="-mx-1 flex max-h-80 flex-col overflow-y-auto">
        {agents.data.map((agent) => (
          <li key={agent.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60">
              <Checkbox
                className="mt-0.5"
                checked={current.has(agent.id)}
                onCheckedChange={(checked) => toggle(agent.id, checked)}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{agent.name}</span>
                <span className="text-muted-foreground">
                  {getDropdownOptionLabel(AgentAccessStatusOptions, agent.status)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <DialogFooter>
        <Button type="button" variant="outline" disabled={setAccess.isPending} onClick={onClose}>
          Cancel
        </Button>
        <ActionButtonWithPending
          isPending={setAccess.isPending}
          disabled={selected === null}
          onClick={() => setAccess.mutate({ id: member.id, agent_uuids: [...current] }, { onSuccess: onClose })}
        >
          Save access
        </ActionButtonWithPending>
      </DialogFooter>
    </>
  );
};

export const AgentAccessDialog: FC<AgentAccessDialogProps> = ({ member, onClose }) => (
  <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Agent access for {member?.user.name ?? member?.user.email}</DialogTitle>
        <DialogDescription>Members only see the agents they have been granted.</DialogDescription>
      </DialogHeader>
      {member ? <AgentAccessList key={member.id} member={member} onClose={onClose} /> : null}
    </DialogContent>
  </Dialog>
);
