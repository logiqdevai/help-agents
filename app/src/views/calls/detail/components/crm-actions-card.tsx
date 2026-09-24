"use client";

import type { FC } from "react";
import { BanIcon, CircleCheckIcon, ClockIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { CallActionStatusFormOptions } from "@/config/constants/dropdowns/calls/call-action-status-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useRetryCallAction } from "@/features/calls/hooks/use-calls";
import {
  ActionStatuses,
  type ActionStatus,
  type CallDetail,
  type CrmAction,
} from "@/features/calls/interfaces/calls.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDateTime, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CRM_ACTIONS_ANCHOR } from "@/views/calls/detail/constants";

type StepTone = "neutral" | "ok" | "bad";

const stepClasses: Record<StepTone, string> = {
  neutral: "bg-secondary text-foreground",
  ok: "bg-semantic-success/10 text-semantic-success",
  bad: "bg-destructive/10 text-destructive",
};

const statusLabel = (status: ActionStatus) => getDropdownOptionLabel(CallActionStatusFormOptions, status);

/** Requested → Validated → Executed / Failed: the path an AI-requested action walked through. */
function lifecycleSteps(action: CrmAction): { label: string; tone: StepTone }[] {
  const requested = { label: statusLabel(ActionStatuses.REQUESTED), tone: "neutral" as const };
  const validated = { label: statusLabel(ActionStatuses.APPROVED), tone: "neutral" as const };

  switch (action.status) {
    case ActionStatuses.REQUESTED:
      return [requested];
    case ActionStatuses.APPROVED:
      return [requested, validated];
    case ActionStatuses.REJECTED:
      return [requested, { label: statusLabel(action.status), tone: "bad" }];
    case ActionStatuses.EXECUTED:
      return [
        requested,
        validated,
        {
          label: `${statusLabel(action.status)}${action.executed_at ? ` ${formatTime(action.executed_at)}` : ""}`,
          tone: "ok",
        },
      ];
    case ActionStatuses.RETRYING:
      return [requested, validated, { label: statusLabel(action.status), tone: "neutral" }];
    case ActionStatuses.FAILED:
    case ActionStatuses.NEEDS_ATTENTION:
      return [requested, validated, { label: statusLabel(ActionStatuses.FAILED), tone: "bad" }];
    default:
      return [requested, { label: statusLabel(action.status), tone: "neutral" }];
  }
}

function StatusIcon({ status }: { status: ActionStatus }) {
  switch (status) {
    case ActionStatuses.EXECUTED:
      return <CircleCheckIcon className="size-4 text-semantic-success" aria-hidden="true" />;
    case ActionStatuses.FAILED:
    case ActionStatuses.NEEDS_ATTENTION:
    case ActionStatuses.REJECTED:
      return <TriangleAlertIcon className="size-4 text-destructive" aria-hidden="true" />;
    case ActionStatuses.CANCELED:
      return <BanIcon className="size-4 text-muted-foreground" aria-hidden="true" />;
    default:
      return <ClockIcon className="size-4 text-muted-foreground" aria-hidden="true" />;
  }
}

const ActionRow: FC<{ callId: string; action: CrmAction }> = ({ callId, action }) => {
  const { can } = usePermissions();
  const retry = useRetryCallAction();
  const needsAttention = action.status === ActionStatuses.NEEDS_ATTENTION;

  return (
    <li className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5">
          <StatusIcon status={action.status} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{action.label}</p>
          {action.tool_name && action.tool_name !== action.label ? (
            <p className="text-[13px] text-muted-foreground">{action.tool_name}</p>
          ) : null}

          {needsAttention ? (
            <StatusBadge tone={StatusTones.DANGER} className="mt-2">
              {statusLabel(action.status)}
            </StatusBadge>
          ) : null}

          <ol className="mt-2.5 flex flex-wrap items-center gap-1 text-xs" aria-label="Progress">
            {lifecycleSteps(action).map((step, index) => (
              <li key={step.label} className="flex items-center gap-1">
                {index > 0 ? <span className="text-muted-foreground" aria-hidden="true">→</span> : null}
                <span className={cn("rounded-full px-2 py-0.5 font-medium", stepClasses[step.tone])}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          {action.attempt_count > 0 && action.status !== ActionStatuses.EXECUTED ? (
            <p className="mt-2 text-[13px] text-muted-foreground">
              Attempt {action.attempt_count} of {action.max_attempts}
              {action.next_retry_at ? ` · next retry ${formatDateTime(action.next_retry_at)}` : ""}
            </p>
          ) : null}
          {action.error ? <p className="mt-2 text-[13px] text-muted-foreground">{action.error}</p> : null}

          {action.can_retry && can(Permissions.CALLS_MANAGE) ? (
            <ActionButtonWithPending
              variant="outline"
              size="sm"
              className="mt-3"
              isPending={retry.isPending}
              onClick={() => retry.mutate({ callId, actionId: action.id })}
            >
              <RefreshCwIcon data-icon="inline-start" /> Retry CRM update
            </ActionButtonWithPending>
          ) : null}
        </div>
      </div>
    </li>
  );
};

interface CrmActionsCardProps {
  call: CallDetail;
}

export const CrmActionsCard: FC<CrmActionsCardProps> = ({ call }) => {
  const integrations = [...new Set(call.crm_actions.map((action) => action.integration_name).filter(Boolean))];

  return (
    <Card id={CRM_ACTIONS_ANCHOR}>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>CRM actions</CardTitle>
        {integrations.length ? <span className="text-sm text-muted-foreground">{integrations.join(", ")}</span> : null}
      </CardHeader>
      <CardContent>
        {call.crm_actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No CRM actions were requested for this call.</p>
        ) : (
          <ul className="divide-y divide-border">
            {call.crm_actions.map((action) => (
              <ActionRow key={action.id} callId={call.id} action={action} />
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          The AI can only <em>request</em> an action. The platform checks the agent&apos;s permission, the company,
          the connection and the payload before anything is carried out.
        </p>
      </CardContent>
    </Card>
  );
};
