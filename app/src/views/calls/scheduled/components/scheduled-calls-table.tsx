"use client";

import type { FC } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScheduledCallSourceFormOptions } from "@/config/constants/dropdowns/calls/scheduled-call-source-form.options";
import { getScheduledCallReasonLabel } from "@/config/constants/dropdowns/calls/scheduled-call-reason-form.options";
import {
  ScheduledCallStatuses,
  ScheduledCallTabs,
  type ScheduledCall,
  type ScheduledCallTab,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { initialsOf } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { formatScheduledFor } from "@/views/calls/utils/call-format";
import { ScheduledCallStatusBadge } from "./scheduled-call-status-badge";

interface ScheduledCallsTableProps {
  tab: ScheduledCallTab;
  scheduledCalls: ScheduledCall[];
  canManage: boolean;
  onCallNow: (scheduledCall: ScheduledCall) => void;
  onReschedule: (scheduledCall: ScheduledCall) => void;
  onCancel: (scheduledCall: ScheduledCall) => void;
}

export const ScheduledCallsTable: FC<ScheduledCallsTableProps> = ({
  tab,
  scheduledCalls,
  canManage,
  onCallNow,
  onReschedule,
  onCancel,
}) => (
  <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Contact</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>{tab === ScheduledCallTabs.PENDING ? "Scheduled for" : "Was scheduled for"}</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Attempt</TableHead>
          <TableHead>Status</TableHead>
          {tab === ScheduledCallTabs.CANCELED ? <TableHead>Reason</TableHead> : null}
          {tab === ScheduledCallTabs.COMPLETED ? <TableHead className="text-right">Call</TableHead> : null}
          {tab === ScheduledCallTabs.PENDING ? <TableHead className="text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduledCalls.map((scheduledCall) => {
          const when = formatScheduledFor(scheduledCall.scheduled_for);
          const isDialing = scheduledCall.status === ScheduledCallStatuses.IN_PROGRESS;
          const name = scheduledCall.contact.name ?? scheduledCall.contact.phone ?? "Unknown contact";
          return (
            <TableRow key={scheduledCall.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-gradient-mint/50 text-[10px] font-medium">
                      {initialsOf(scheduledCall.contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    <span className="block font-medium">{name}</span>
                    {scheduledCall.contact.name ? (
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {scheduledCall.contact.phone}
                      </span>
                    ) : null}
                  </span>
                </div>
              </TableCell>
              <TableCell>{scheduledCall.agent.name}</TableCell>
              <TableCell>
                <span className="block font-medium">{isDialing ? "Now" : when.primary}</span>
                <span className="block text-xs text-muted-foreground">{isDialing ? "Dialing" : when.secondary}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getDropdownOptionLabel(ScheduledCallSourceFormOptions, scheduledCall.source)}
                </Badge>
              </TableCell>
              <TableCell>
                Attempt {scheduledCall.attempt_number} of {Math.max(scheduledCall.max_attempts, scheduledCall.attempt_number)}
              </TableCell>
              <TableCell>
                <ScheduledCallStatusBadge status={scheduledCall.status} />
                {tab === ScheduledCallTabs.COMPLETED && scheduledCall.closed_reason ? (
                  <span className="mt-1 block max-w-48 text-xs whitespace-normal text-muted-foreground">
                    {getScheduledCallReasonLabel(scheduledCall.closed_reason)}
                  </span>
                ) : null}
              </TableCell>
              {tab === ScheduledCallTabs.CANCELED ? (
                <TableCell className="max-w-64 text-xs whitespace-normal text-muted-foreground">
                  {getScheduledCallReasonLabel(scheduledCall.closed_reason) || "—"}
                </TableCell>
              ) : null}
              {tab === ScheduledCallTabs.COMPLETED ? (
                <TableCell className="text-right">
                  {scheduledCall.call ? (
                    <Link
                      href={Routes.calls.detail(scheduledCall.call.id)}
                      className="text-foreground underline underline-offset-4"
                    >
                      #{scheduledCall.call.call_number}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              ) : null}
              {tab === ScheduledCallTabs.PENDING ? (
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {isDialing && scheduledCall.call ? (
                      <Link
                        href={Routes.calls.detail(scheduledCall.call.id)}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View call
                      </Link>
                    ) : null}
                    {canManage && !isDialing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onCallNow(scheduledCall)}>
                          Call now
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onReschedule(scheduledCall)}>
                          Reschedule
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onCancel(scheduledCall)}>
                          Cancel
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);
