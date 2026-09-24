import type { FC } from "react";
import { SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CallStatuses,
  LiveCallStatuses,
  ProcessingStatuses,
  type CallDetail,
} from "@/features/calls/interfaces/calls.interfaces";

interface CallSummaryCardProps {
  call: CallDetail;
}

export const CallSummaryCard: FC<CallSummaryCardProps> = ({ call }) => {
  const isLive = LiveCallStatuses.includes(call.status);
  const isBeingPrepared =
    !call.summary &&
    (call.status === CallStatuses.COMPLETED || call.status === CallStatuses.TRANSFERRED) &&
    (call.analysis_status === ProcessingStatuses.PENDING || call.analysis_status === ProcessingStatuses.PROCESSING);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Summary</CardTitle>
        <Badge variant="outline">
          <SparklesIcon data-icon="inline-start" /> AI-generated
        </Badge>
      </CardHeader>
      <CardContent>
        {call.summary ? (
          <p className="text-[15px] leading-relaxed text-body">{call.summary}</p>
        ) : isBeingPrepared ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
            <p className="mt-1 text-sm text-muted-foreground">The summary is being prepared and will appear shortly.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLive
              ? "A summary is written once the call has ended."
              : "There is no summary for this call — it may have ended before a conversation took place."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
