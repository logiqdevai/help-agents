"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneIncomingIcon, PhoneOutgoingIcon, TriangleAlertIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallDirectionFormOptions } from "@/config/constants/dropdowns/calls/call-direction-form.options";
import {
  CallDirections,
  LiveCallStatuses,
  type CallListItem,
} from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatClock, formatMoney } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { CallStatusBadge } from "@/views/calls/components/call-status-badge";
import { formatCallStart, getCustomerNumber } from "@/views/calls/utils/call-format";

interface CallsTableProps {
  calls: CallListItem[];
}

const Muted: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-muted-foreground">{children}</span>
);

export const CallsTable: FC<CallsTableProps> = ({ calls }) => {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone number</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => {
            const isLive = LiveCallStatuses.includes(call.status);
            const DirectionIcon = call.direction === CallDirections.INBOUND ? PhoneIncomingIcon : PhoneOutgoingIcon;
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
                <TableCell className="font-medium">{call.agent.name}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    {call.contact_name ?? <Muted>Unknown caller</Muted>}
                    {call.is_test ? <Badge variant="outline">Test</Badge> : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {call.is_test ? "Test call" : (call.contact?.integration?.name ?? "Not in CRM")}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{getCustomerNumber(call) ?? "—"}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <DirectionIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {getDropdownOptionLabel(CallDirectionFormOptions, call.direction)}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{formatClock(call.duration_seconds)}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <CallStatusBadge status={call.status} />
                    {call.has_pending_issues ? (
                      <span title="A CRM update needs attention" className="text-destructive">
                        <TriangleAlertIcon className="size-3.5" aria-label="A CRM update needs attention" />
                      </span>
                    ) : null}
                  </span>
                  {call.failure_reason ? (
                    <span className="block max-w-48 text-xs whitespace-normal text-muted-foreground">
                      {call.failure_reason}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  {call.outcome ? call.outcome.label : isLive ? <Muted>Pending</Muted> : <Muted>—</Muted>}
                </TableCell>
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
