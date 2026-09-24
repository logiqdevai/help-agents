"use client";

import type { FC } from "react";
import Link from "next/link";
import { FlaskConicalIcon } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCalls } from "@/features/calls/hooks/use-calls";
import { formatClock } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { CallStatusBadge } from "@/views/calls/components/call-status-badge";
import { formatCallStart } from "@/views/calls/utils/call-format";

const RECENT_TEST_CALLS = 5;

/** The latest test calls of an agent, each linking to its transcript, summary and CRM actions. */
export const AgentTestCalls: FC<{ agentId: string }> = ({ agentId }) => {
  const calls = useGetCalls({ agent_uuid: agentId, is_test: "true", limit: RECENT_TEST_CALLS });

  if (calls.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (calls.isError) {
    return <ErrorState title="Could not load test calls" message={calls.error.message} onRetry={() => calls.refetch()} />;
  }

  if (calls.data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
          <FlaskConicalIcon className="size-5" aria-hidden="true" />
        </span>
        <p className="font-medium">Your test call results will appear here</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Transcript, summary, the information gathered, and the CRM actions the agent requested.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {calls.data.data.map((call) => (
        <li key={call.id}>
          <Link
            href={Routes.calls.detail(call.id)}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-hairline-strong"
          >
            <span className="font-medium">{formatCallStart(call)}</span>
            <span className="text-muted-foreground">{call.contact_name ?? "Test call"}</span>
            <span className="tabular-nums text-muted-foreground">{formatClock(call.duration_seconds)}</span>
            <span className="ml-auto flex items-center gap-3">
              <span className="text-muted-foreground">{call.outcome?.label ?? ""}</span>
              <CallStatusBadge status={call.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
