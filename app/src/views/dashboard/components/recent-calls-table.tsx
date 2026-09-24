import type { FC } from "react";
import Link from "next/link";
import { isToday, parseISO } from "date-fns";
import { PhoneIncomingIcon, PhoneOutgoingIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallDirectionFormOptions } from "@/config/constants/dropdowns/calls/call-direction-form.options";
import { CallStatusFormOptions } from "@/config/constants/dropdowns/calls/call-status-form.options";
import { CallDirections, CallStatuses, type CallStatus } from "@/features/calls/interfaces/calls.interfaces";
import type { DashboardRecentCall } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatClock, formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const statusTones: Record<CallStatus, StatusTone> = {
  [CallStatuses.COMPLETED]: StatusTones.SUCCESS,
  [CallStatuses.TRANSFERRED]: StatusTones.INFO,
  [CallStatuses.IN_PROGRESS]: StatusTones.INFO,
  [CallStatuses.RINGING]: StatusTones.INFO,
  [CallStatuses.QUEUED]: StatusTones.INFO,
  [CallStatuses.NO_ANSWER]: StatusTones.WARNING,
  [CallStatuses.BUSY]: StatusTones.WARNING,
  [CallStatuses.FAILED]: StatusTones.DANGER,
  [CallStatuses.SCHEDULED]: StatusTones.NEUTRAL,
  [CallStatuses.CANCELED]: StatusTones.NEUTRAL,
};

interface RecentCallsTableProps {
  calls: DashboardRecentCall[];
}

export const RecentCallsTable: FC<RecentCallsTableProps> = ({ calls }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-display text-2xl font-light tracking-tight">Recent calls</h3>
      <Link href={Routes.calls.root} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        View all calls
      </Link>
    </div>
    {calls.length === 0 ? (
      <Card className="py-10 text-center text-sm text-muted-foreground">
        No calls yet. Calls placed and received by your agents appear here.
      </Card>
    ) : (
      <Card className="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11 px-6">Date</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="px-6 text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => {
              const when = call.started_at ?? call.created_at;
              const isInbound = call.direction === CallDirections.INBOUND;
              const DirectionIcon = isInbound ? PhoneIncomingIcon : PhoneOutgoingIcon;
              return (
                <TableRow key={call.id}>
                  <TableCell className="px-6 py-3 whitespace-nowrap">
                    <Link href={Routes.calls.detail(call.id)} className="block">
                      <span className="block font-medium">
                        {isToday(parseISO(when)) ? formatTime(when) : formatDateTime(when)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Call #{call.call_number}
                        {call.is_test ? " · Test" : ""}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{call.agent.name}</TableCell>
                  <TableCell>
                    <span className="block">{call.contact_name ?? "Unknown contact"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {(isInbound ? call.from_number : call.to_number) ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <DirectionIcon className="size-3.5" aria-hidden="true" />
                      {getDropdownOptionLabel(CallDirectionFormOptions, call.direction)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatClock(call.duration_seconds)}</TableCell>
                  <TableCell>
                    <StatusBadge tone={statusTones[call.status]}>
                      {getDropdownOptionLabel(CallStatusFormOptions, call.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{call.outcome_label ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="px-6 text-right tabular-nums">
                    {formatMoney(call.total_cost, call.currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    )}
  </section>
);
