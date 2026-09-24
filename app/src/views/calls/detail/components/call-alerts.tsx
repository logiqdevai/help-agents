"use client";

import type { FC } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Permissions } from "@/config/constants/permissions";
import { useRetryCallAction } from "@/features/calls/hooks/use-calls";
import { CallWarningTypes, type CallDetail } from "@/features/calls/interfaces/calls.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { CRM_ACTIONS_ANCHOR } from "@/views/calls/detail/constants";

interface CallAlertsProps {
  call: CallDetail;
}

/** Spec §33: the call is saved even when a CRM step fails — say so, and offer a retry. */
export const CallAlerts: FC<CallAlertsProps> = ({ call }) => {
  const { can } = usePermissions();
  const retry = useRetryCallAction();
  const failedActions = call.crm_actions.filter((action) => action.can_retry);
  const callFailed = call.warnings.find((warning) => warning.type === CallWarningTypes.CALL_FAILED);
  const analysisFailed = call.warnings.some((warning) => warning.type === CallWarningTypes.ANALYSIS_FAILED);
  const canRetry = can(Permissions.CALLS_MANAGE);

  return (
    <>
      {callFailed ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>This call failed</AlertTitle>
          <AlertDescription>{callFailed.message}</AlertDescription>
        </Alert>
      ) : null}

      {failedActions.length > 0 ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <TriangleAlertIcon />
          <AlertTitle>
            {failedActions.length === 1
              ? "1 CRM update needs attention."
              : `${failedActions.length} CRM updates need attention.`}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>The call, its transcript and results are saved. The update can be retried manually.</span>
            {failedActions.length === 1 && canRetry ? (
              <ActionButtonWithPending
                variant="outline"
                size="sm"
                isPending={retry.isPending}
                onClick={() => retry.mutate({ callId: call.id, actionId: failedActions[0].id })}
              >
                Retry CRM update
              </ActionButtonWithPending>
            ) : (
              <a href={`#${CRM_ACTIONS_ANCHOR}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Review updates
              </a>
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      {analysisFailed ? (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>The call could not be analyzed</AlertTitle>
          <AlertDescription>
            The transcript and recording are saved, but the summary and outcome may be missing.
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  );
};
