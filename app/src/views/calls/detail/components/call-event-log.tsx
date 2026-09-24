"use client";

import { useState, type FC } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCallEventTypeLabel } from "@/config/constants/dropdowns/calls/call-event-type-form.options";
import type { CallEvent } from "@/features/calls/interfaces/calls.interfaces";
import { cn } from "@/lib/utils";
import { formatTimeWithSeconds } from "@/views/calls/utils/call-format";

const EVENT_LOG_ID = "call-event-log";
const problemEventPattern = /(failed|rejected)$/;

interface CallEventLogProps {
  events: CallEvent[];
}

/** Technical trail for troubleshooting (spec §24). */
export const CallEventLog: FC<CallEventLogProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <CardTitle>Behind-the-scenes activity</CardTitle>
          <CardDescription>A technical trail for troubleshooting.</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={EVENT_LOG_ID}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {isOpen ? (
        <CardContent id={EVENT_LOG_ID}>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing has been recorded for this call yet.</p>
          ) : (
            <ol>
              {events.map((event, index) => {
                const label = getCallEventTypeLabel(event.type);
                const isProblem = problemEventPattern.test(event.type);
                return (
                  <li key={event.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {index < events.length - 1 ? (
                      <span aria-hidden="true" className="absolute top-6 bottom-0 left-3 w-px bg-border" />
                    ) : null}
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        isProblem ? "bg-destructive/10 text-destructive" : "bg-semantic-success/10 text-semantic-success",
                      )}
                    >
                      {isProblem ? (
                        <XIcon className="size-3.5" aria-hidden="true" />
                      ) : (
                        <CheckIcon className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 text-sm leading-snug">
                      <span className="font-medium">{label}</span>
                      {event.message && event.message.toLowerCase() !== label.toLowerCase() ? (
                        <span className="text-muted-foreground"> · {event.message}</span>
                      ) : null}
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {formatTimeWithSeconds(event.occurred_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
};
