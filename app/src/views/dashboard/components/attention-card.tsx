"use client";

import type { FC } from "react";
import Link from "next/link";
import { CircleCheckIcon, PhoneOffIcon, RefreshCwIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { AttentionReasonFormOptions } from "@/config/constants/dropdowns/dashboard/attention-reason-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useRetryCrmUpdate } from "@/features/alerts/hooks/use-alerts";
import {
  AttentionReasonTypes,
  type DashboardAttentionCall,
} from "@/features/dashboard/interfaces/dashboard.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const VISIBLE_ITEMS = 5;

interface AttentionCardProps {
  calls: DashboardAttentionCall[];
}

export const AttentionCard: FC<AttentionCardProps> = ({ calls }) => {
  const { can } = usePermissions();
  const retry = useRetryCrmUpdate();
  const canRetry = can(Permissions.CALLS_MANAGE);
  const items = calls.slice(0, VISIBLE_ITEMS);

  return (
    <SectionCard
      title="Needs attention"
      flush
      footer={calls.length > VISIBLE_ITEMS ? `${calls.length - VISIBLE_ITEMS} more in the last 7 days` : undefined}
      actions={
        <Link href={Routes.alerts} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          All alerts
        </Link>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <CircleCheckIcon className="size-6 text-semantic-success" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Nothing needs attention. Failed calls and CRM updates show up here.
          </p>
        </div>
      ) : (
        <ul>
          {items.map((call) => {
            const isCrm = call.reason.type === AttentionReasonTypes.CRM_UPDATE_FAILED;
            const Icon = isCrm ? RefreshCwIcon : PhoneOffIcon;
            const actionId = call.reason.action_id;
            return (
              <li
                key={call.id}
                className="flex items-center gap-3.5 border-b border-border px-6 py-3.5 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {getDropdownOptionLabel(AttentionReasonFormOptions, call.reason.type)} · Call #{call.call_number}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {[call.contact_name, call.reason.message].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {isCrm && actionId && canRetry ? (
                  <ActionButtonWithPending
                    variant="outline"
                    size="sm"
                    isPending={retry.isPending && retry.variables?.actionId === actionId}
                    onClick={() => retry.mutate({ callId: call.id, actionId })}
                  >
                    Retry
                  </ActionButtonWithPending>
                ) : (
                  <Link
                    href={Routes.calls.detail(call.id)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    View
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};
