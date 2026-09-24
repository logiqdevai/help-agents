"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneCallIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetCalls } from "@/features/calls/hooks/use-calls";
import { LiveCallStatuses } from "@/features/calls/interfaces/calls.interfaces";
import { formatClock, formatMoney } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { CallStatusBadge } from "@/views/calls/components/call-status-badge";
import { formatCallStart, getCustomerNumber } from "@/views/calls/utils/call-format";

interface RecentCallsTableProps {
  agentId: string;
  limit: number;
  /** Adds the customer's phone number column. */
  showPhone?: boolean;
}

const Muted: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-muted-foreground">{children}</span>
);

/** The latest real calls of one agent (test calls are left out). */
export const RecentCallsTable: FC<RecentCallsTableProps> = ({ agentId, limit, showPhone = false }) => {
  const router = useRouter();
  const calls = useGetCalls({ agent_uuid: agentId, limit });

  if (calls.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (calls.isError) {
    return <ErrorState title="Could not load calls" message={calls.error.message} onRetry={() => calls.refetch()} />;
  }

  if (calls.data.data.length === 0) {
    return (
      <EmptyState
        icon={PhoneCallIcon}
        title="No calls yet"
        description="Calls this agent makes or receives show up here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Time</TableHead>
            <TableHead>Contact</TableHead>
            {showPhone ? <TableHead>Phone number</TableHead> : null}
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.data.data.map((call) => {
            const isLive = LiveCallStatuses.includes(call.status);
            return (
              <TableRow
                key={call.id}
                className="cursor-pointer"
                onClick={() => router.push(Routes.calls.detail(call.id))}
              >
                <TableCell>
                  <Link
                    href={Routes.calls.detail(call.id)}
                    className="font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {formatCallStart(call)}
                  </Link>
                  <span className="block text-xs text-muted-foreground">Call #{call.call_number}</span>
                </TableCell>
                <TableCell className="font-medium">{call.contact_name ?? <Muted>Unknown caller</Muted>}</TableCell>
                {showPhone ? <TableCell className="tabular-nums">{getCustomerNumber(call) ?? "—"}</TableCell> : null}
                <TableCell className="tabular-nums">{formatClock(call.duration_seconds)}</TableCell>
                <TableCell>
                  <CallStatusBadge status={call.status} />
                </TableCell>
                <TableCell>{call.outcome ? call.outcome.label : <Muted>{isLive ? "Pending" : "—"}</Muted>}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {isLive ? <Muted>—</Muted> : formatMoney(call.total_cost, call.currency)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
