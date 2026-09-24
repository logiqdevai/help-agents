"use client";

import type { FC } from "react";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useGetCall } from "@/features/calls/hooks/use-calls";
import { CallAlerts } from "./components/call-alerts";
import { CallContextCards } from "./components/call-context-cards";
import { CallCostCard } from "./components/call-cost-card";
import { CallDetailHeader } from "./components/call-detail-header";
import { CallEventLog } from "./components/call-event-log";
import { CallMetaCard } from "./components/call-meta-card";
import { CallSummaryCard } from "./components/call-summary-card";
import { CrmActionsCard } from "./components/crm-actions-card";
import { GatheredInformationCard } from "./components/gathered-information-card";
import { RecordingPlayer } from "./components/recording-player";
import { TranscriptCard } from "./components/transcript-card";

interface CallDetailPageProps {
  id: string;
}

const CallDetailPage: FC<CallDetailPageProps> = ({ id }) => {
  const call = useGetCall(id);

  if (call.isPending) return <DetailSkeleton cards={4} />;

  if (call.isError) {
    return (
      <ErrorState title="Could not load this call" message={call.error.message} onRetry={() => call.refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CallDetailHeader call={call.data} />
      <CallAlerts call={call.data} />
      <CallMetaCard call={call.data} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <CallSummaryCard call={call.data} />
          <RecordingPlayer call={call.data} />
          <TranscriptCard call={call.data} />
          <GatheredInformationCard items={call.data.information_gathered} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <CallCostCard call={call.data} />
          <CrmActionsCard call={call.data} />
          <CallContextCards call={call.data} />
        </div>
      </div>

      <CallEventLog events={call.data.activity_log} />
    </div>
  );
};

export default CallDetailPage;
