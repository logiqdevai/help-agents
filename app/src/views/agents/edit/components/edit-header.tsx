"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, FlaskConicalIcon } from "lucide-react";
import { AgentMark } from "@/components/ui/agent-mark";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Permissions } from "@/config/constants/permissions";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { AgentStatusBadge } from "@/views/agents/components/agent-status-badge";

interface EditHeaderProps {
  agent: Agent;
  hasUnsaved: boolean;
  onTest: () => void;
}

/** Back link, title, status and the test button; leaving with unsaved changes asks first. */
export const EditHeader: FC<EditHeaderProps> = ({ agent, hasUnsaved, onTest }) => {
  const router = useRouter();
  const { can } = usePermissions();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const summary = agent.description || agent.purpose;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={Routes.agents.detail(agent.id)}
        onClick={(event) => {
          if (!hasUnsaved) return;
          event.preventDefault();
          setLeaveOpen(true);
        }}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {agent.name}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <AgentMark seed={agent.id} className="size-14 [&>svg]:size-6" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">Edit agent</h2>
              <AgentStatusBadge status={agent.status} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {[agent.name, summary].filter(Boolean).join(" · ")}. Changes apply to new calls once saved. Calls
              already made keep the setup they had.
            </p>
          </div>
        </div>
        {can(Permissions.CALLS_PLACE) ? (
          <Button variant="outline" onClick={onTest}>
            <FlaskConicalIcon aria-hidden="true" />
            Test agent
          </Button>
        ) : null}
      </div>

      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        variant="default"
        title="Leave without saving?"
        description="You have changes that are not saved yet. If you leave now they are lost."
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        onConfirm={() => router.push(Routes.agents.detail(agent.id))}
      />
    </div>
  );
};
