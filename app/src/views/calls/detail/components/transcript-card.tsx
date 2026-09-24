import type { FC } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallTranscriptRoleFormOptions } from "@/config/constants/dropdowns/calls/call-transcript-role-form.options";
import {
  LiveCallStatuses,
  TranscriptRoles,
  type CallDetail,
} from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatClock, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TranscriptCardProps {
  call: CallDetail;
}

export const TranscriptCard: FC<TranscriptCardProps> = ({ call }) => {
  const { transcript } = call;
  const callerName = call.contact?.name ?? call.contact_name;
  const isLive = LiveCallStatuses.includes(call.status);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Transcript</CardTitle>
        {transcript.length ? (
          <span className="text-sm text-muted-foreground">
            {formatClock(call.duration_seconds)} · {transcript.length} {transcript.length === 1 ? "turn" : "turns"}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        {transcript.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isLive
              ? "The transcript appears here once the call has ended."
              : "No transcript is available — nobody spoke on this call."}
          </p>
        ) : (
          <ol className="flex flex-col gap-3.5">
            {transcript.map((segment, index) => {
              const isAgent = segment.role === TranscriptRoles.AGENT;
              return (
                <li key={index} className={cn("flex items-start gap-3", !isAgent && "flex-row-reverse")}>
                  <Avatar size="sm" className="mt-0.5">
                    <AvatarFallback className={cn("text-[10px] font-medium", isAgent && "bg-gradient-mint/60")}>
                      {isAgent ? "AI" : initialsOf(callerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("min-w-0 max-w-[85%] sm:max-w-[78%]", !isAgent && "text-right")}>
                    <span className="sr-only">
                      {getDropdownOptionLabel(CallTranscriptRoleFormOptions, segment.role)}:
                    </span>
                    <p
                      className={cn(
                        "inline-block rounded-2xl px-3.5 py-2.5 text-left text-[14.5px] leading-normal",
                        isAgent
                          ? "rounded-tl-sm bg-secondary"
                          : "rounded-tr-sm border border-hairline-strong bg-card",
                      )}
                    >
                      {segment.text}
                    </p>
                    {segment.start !== undefined ? (
                      <span className="mt-1 block text-[11px] text-muted-foreground tabular-nums">
                        {formatClock(segment.start)}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
