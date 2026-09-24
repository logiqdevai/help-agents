"use client";

import type { FC } from "react";
import Link from "next/link";
import { BotIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAgentOptions } from "@/features/phone-numbers/hooks/use-agent-options";
import { Routes } from "@/routes/routes";

interface AgentPickerProps {
  value: string[];
  onChange: (agentIds: string[]) => void;
  disabled?: boolean;
}

/** Checklist of the company's agents, used to choose who can draw on a knowledge source. */
export const AgentPicker: FC<AgentPickerProps> = ({ value, onChange, disabled }) => {
  const agents = useGetAgentOptions();

  if (agents.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (agents.isError) {
    return <ErrorState title="Could not load agents" message={agents.error.message} onRetry={() => agents.refetch()} />;
  }

  if (!agents.data.length) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        You have no agents yet.{" "}
        <Link href={Routes.agents.create} className="text-foreground underline underline-offset-4">
          Create an agent
        </Link>{" "}
        to give it this knowledge.
      </p>
    );
  }

  const toggle = (agentId: string, checked: boolean) =>
    onChange(checked ? [...value, agentId] : value.filter((id) => id !== agentId));

  return (
    <ul className="flex flex-col divide-y divide-border">
      {agents.data.map((agent) => (
        <li key={agent.id}>
          <label className="flex cursor-pointer items-center gap-3 py-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-mint/50"
            >
              <BotIcon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{agent.name}</span>
            <Checkbox
              checked={value.includes(agent.id)}
              onCheckedChange={(checked) => toggle(agent.id, checked)}
              disabled={disabled}
            />
          </label>
        </li>
      ))}
    </ul>
  );
};
