"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarClockIcon, CopyIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Permissions } from "@/config/constants/permissions";
import { useStopCall } from "@/features/calls/hooks/use-calls";
import { CallDirections, LiveCallStatuses, type CallDetail } from "@/features/calls/interfaces/calls.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { notify } from "@/lib/notify";
import { Routes } from "@/routes/routes";
import { CallStatusBadge } from "@/views/calls/components/call-status-badge";
import { ScheduleCallDialog } from "@/views/calls/scheduled/components/schedule-call-dialog";
import { formatLongDateTime } from "@/views/calls/utils/call-format";

interface CallDetailHeaderProps {
  call: CallDetail;
}

export const CallDetailHeader: FC<CallDetailHeaderProps> = ({ call }) => {
  const { can } = usePermissions();
  const stopCall = useStopCall();
  const [isStopping, setIsStopping] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const isLive = LiveCallStatuses.includes(call.status);
  const isInbound = call.direction === CallDirections.INBOUND;
  const contactName = call.contact?.name ?? call.contact_name;

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(call.transcript_text ?? "");
      notify.success("Transcript copied");
    } catch {
      notify.error("Could not copy the transcript", "Your browser blocked access to the clipboard.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={Routes.calls.root}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" /> All calls
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">Call #{call.call_number}</h2>
            <CallStatusBadge status={call.status} />
            {call.outcome ? <Badge variant="outline">{call.outcome.label}</Badge> : null}
            {call.is_test ? <Badge variant="outline">Test call</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isInbound ? "Inbound call from" : "Outbound call to"} {contactName ?? "an unknown number"} ·{" "}
            {formatLongDateTime(call.started_at ?? call.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLive && can(Permissions.CALLS_MANAGE) ? (
            <Button variant="destructive" onClick={() => setIsStopping(true)}>
              <SquareIcon data-icon="inline-start" /> Stop call
            </Button>
          ) : null}
          {call.transcript_text ? (
            <Button variant="outline" onClick={copyTranscript}>
              <CopyIcon data-icon="inline-start" /> Copy transcript
            </Button>
          ) : null}
          {call.contact && can(Permissions.SCHEDULING_MANAGE) ? (
            <Button variant="outline" onClick={() => setIsScheduling(true)}>
              <CalendarClockIcon data-icon="inline-start" /> Schedule follow-up
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmationDialog
        open={isStopping}
        onOpenChange={setIsStopping}
        title="Stop this call?"
        description="The agent will hang up right away. The call and anything said so far are kept."
        confirmLabel="Stop call"
        isPending={stopCall.isPending}
        onConfirm={() => stopCall.mutateAsync(call.id)}
      />

      {call.contact ? (
        <ScheduleCallDialog
          open={isScheduling}
          onOpenChange={setIsScheduling}
          defaults={{ agent_uuid: call.agent.id, contact: call.contact }}
        />
      ) : null}
    </div>
  );
};
