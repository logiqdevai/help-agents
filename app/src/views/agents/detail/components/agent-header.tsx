"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CopyIcon,
  EllipsisIcon,
  FlaskConicalIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import { AgentMark } from "@/components/ui/agent-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Permissions } from "@/config/constants/permissions";
import {
  useActivateAgent,
  useDeactivateAgent,
  useDeleteAgent,
  useDuplicateAgent,
} from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { AgentStatusBadge } from "@/views/agents/components/agent-status-badge";
import { CallDialog, CallDialogVariants } from "@/views/calls/components/call-dialog";

interface AgentHeaderProps {
  agent: Agent;
}

export const AgentHeader: FC<AgentHeaderProps> = ({ agent }) => {
  const router = useRouter();
  const { can } = usePermissions();
  const canWrite = can(Permissions.AGENTS_WRITE);
  const activate = useActivateAgent();
  const deactivate = useDeactivateAgent();
  const duplicate = useDuplicateAgent();
  const deleteAgent = useDeleteAgent();
  const [testOpen, setTestOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDraft = agent.status === AgentStatuses.DRAFT;
  const isActive = agent.status === AgentStatuses.ACTIVE;
  const isSwitching = activate.isPending || deactivate.isPending;
  const summary = agent.description || agent.purpose;

  const toggleActive = (next: boolean) => (next ? activate.mutate(agent.id) : deactivate.mutate(agent.id));

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={Routes.agents.root}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        All agents
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <AgentMark seed={agent.id} className="size-14 [&>svg]:size-6" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{agent.name}</h2>
              <AgentStatusBadge status={agent.status} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {summary ? `${summary} ` : ""}
              Last edited {formatRelative(agent.updated_at)}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canWrite && !isDraft ? (
            <label className="inline-flex h-8 items-center gap-2.5 rounded-full border border-border bg-card pr-3.5 pl-3 text-sm font-medium">
              {isSwitching ? (
                <Spinner className="size-4" />
              ) : (
                <Switch
                  size="sm"
                  checked={isActive}
                  onCheckedChange={toggleActive}
                  aria-label={isActive ? "Turn the agent off" : "Turn the agent on"}
                />
              )}
              {isActive ? "Active" : "Inactive"}
            </label>
          ) : null}
          {canWrite && isDraft ? (
            <Link href={Routes.agents.resume(agent.id)} className={buttonVariants({ variant: "outline" })}>
              <PlayIcon aria-hidden="true" />
              Continue setup
            </Link>
          ) : null}
          {canWrite ? (
            <Link href={Routes.agents.edit(agent.id)} className={buttonVariants({ variant: "outline" })}>
              <PencilIcon aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <Button variant="outline" disabled title="Campaigns arrive in Version 2">
              Start campaign
            </Button>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              Version 2
            </span>
          </span>
          {can(Permissions.CALLS_PLACE) ? (
            <Button onClick={() => setTestOpen(true)}>
              <FlaskConicalIcon />
              Test agent
            </Button>
          ) : null}
          {canWrite ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
                <EllipsisIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={duplicate.isPending}
                  onClick={() =>
                    duplicate.mutate(agent.id, { onSuccess: (copy) => router.push(Routes.agents.detail(copy.id)) })
                  }
                >
                  <CopyIcon aria-hidden="true" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2Icon aria-hidden="true" />
                  Delete agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <CallDialog open={testOpen} onOpenChange={setTestOpen} variant={CallDialogVariants.TEST} agentId={agent.id} />
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${agent.name}?`}
        description="The agent is removed and its phone numbers are unassigned. Scheduled calls are cancelled. Past calls and transcripts stay in your call history."
        confirmLabel="Delete agent"
        isPending={deleteAgent.isPending}
        onConfirm={async () => {
          await deleteAgent.mutateAsync(agent.id);
          router.replace(Routes.agents.root);
        }}
      />
    </div>
  );
};
