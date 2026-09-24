"use client";

import type { FC } from "react";
import { CircleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAgentOverview, useResyncAgent } from "@/features/agents/hooks/use-agents";
import { AgentStatuses, type Agent } from "@/features/agents/interfaces/agents.interfaces";

/**
 * Saving re-prepares a live agent in the background. This tells the user when that did not work and
 * lets them try again; while it works, a live agent is reminded that calls use the last good setup.
 */
export const AgentSyncNotice: FC<{ agent: Agent }> = ({ agent }) => {
  const overview = useGetAgentOverview(agent.id);
  const resync = useResyncAgent();
  const isLive = agent.status === AgentStatuses.ACTIVE;

  if (overview.data && overview.data.unresolved_alerts > 0) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>The latest changes could not be applied yet</AlertTitle>
        <AlertDescription>
          The service that runs the agent is temporarily unavailable. Calls keep using the previous setup until this
          succeeds.
        </AlertDescription>
        <AlertAction>
          <ActionButtonWithPending
            variant="outline"
            size="sm"
            isPending={resync.isPending}
            onClick={() => resync.mutate(agent.id)}
          >
            Try again
          </ActionButtonWithPending>
        </AlertAction>
      </Alert>
    );
  }

  if (!isLive) return null;

  return (
    <Alert>
      <CircleAlertIcon />
      <AlertTitle>This agent is live</AlertTitle>
      <AlertDescription>
        When you save, the agent is updated in the background and its next calls use the new setup. Calls already in
        progress are not affected.
      </AlertDescription>
    </Alert>
  );
};
