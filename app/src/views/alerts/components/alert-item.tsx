"use client";

import type { FC } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  CloudOffIcon,
  InfoIcon,
  PhoneOffIcon,
  PlugIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TagIcon,
  ClockIcon,
  type LucideIcon,
} from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { AlertSeverityFormOptions } from "@/config/constants/dropdowns/alerts/alert-severity-form.options";
import { AlertStatusFormOptions } from "@/config/constants/dropdowns/alerts/alert-status-form.options";
import { AlertTypeFormOptions } from "@/config/constants/dropdowns/alerts/alert-type-form.options";
import { Permissions } from "@/config/constants/permissions";
import {
  useDismissAlert,
  useResolveAlert,
  useRetryCrmUpdate,
} from "@/features/alerts/hooks/use-alerts";
import {
  AlertEntityTypes,
  AlertSeverities,
  AlertStatuses,
  AlertTypes,
  type Alert,
  type AlertSeverity,
  type AlertType,
} from "@/features/alerts/interfaces/alerts.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAlertEntityLink } from "@/views/alerts/utils/alert-entity-link";

const typeIcons: Record<AlertType, LucideIcon> = {
  [AlertTypes.CRM_UPDATE_FAILED]: RefreshCwIcon,
  [AlertTypes.INTEGRATION_FAILED]: PlugIcon,
  [AlertTypes.CALL_FAILED]: PhoneOffIcon,
  [AlertTypes.INVALID_PHONE_NUMBER]: PhoneOffIcon,
  [AlertTypes.NO_PHONE_NUMBER_AVAILABLE]: SmartphoneIcon,
  [AlertTypes.AI_SERVICE_UNAVAILABLE]: CloudOffIcon,
  [AlertTypes.KNOWLEDGE_PROCESSING_FAILED]: BookOpenIcon,
  [AlertTypes.OTHER]: InfoIcon,
};

const severityTones: Record<AlertSeverity, StatusTone> = {
  [AlertSeverities.ERROR]: StatusTones.DANGER,
  [AlertSeverities.WARNING]: StatusTones.WARNING,
  [AlertSeverities.INFO]: StatusTones.INFO,
};

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: FC<AlertItemProps> = ({ alert }) => {
  const { can } = usePermissions();
  const resolve = useResolveAlert();
  const dismiss = useDismissAlert();
  const retry = useRetryCrmUpdate();

  const isOpen = alert.status === AlertStatuses.OPEN;
  const Icon = typeIcons[alert.type];
  const entityLink = getAlertEntityLink(alert);
  const callId = alert.metadata?.call_uuid;
  const actionId = alert.entity_uuid;
  const retryTarget =
    isOpen &&
    can(Permissions.CALLS_MANAGE) &&
    alert.type === AlertTypes.CRM_UPDATE_FAILED &&
    alert.entity_type === AlertEntityTypes.CALL_ACTION &&
    callId &&
    actionId
      ? { callId, actionId }
      : null;
  const canManage = isOpen && can(Permissions.ALERTS_MANAGE);

  return (
    <li className="flex gap-4 border-b border-border px-6 py-5 last:border-b-0">
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
          isOpen && alert.severity === AlertSeverities.ERROR
            ? "bg-destructive/10 text-destructive"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium">{alert.title}</h4>
          {isOpen ? (
            <StatusBadge tone={severityTones[alert.severity]}>
              {getDropdownOptionLabel(AlertSeverityFormOptions, alert.severity)}
            </StatusBadge>
          ) : (
            <StatusBadge tone={alert.status === AlertStatuses.RESOLVED ? StatusTones.SUCCESS : StatusTones.NEUTRAL}>
              {getDropdownOptionLabel(AlertStatusFormOptions, alert.status)}
            </StatusBadge>
          )}
        </div>
        {alert.message ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{alert.message}</p> : null}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TagIcon className="size-3.5" aria-hidden="true" />
            {getDropdownOptionLabel(AlertTypeFormOptions, alert.type)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            {formatDateTime(alert.created_at)}
            {alert.resolved_at ? ` · resolved ${formatDateTime(alert.resolved_at)}` : ""}
          </span>
        </div>
        {retryTarget || entityLink || canManage ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {retryTarget ? (
              <ActionButtonWithPending
                variant="outline"
                size="sm"
                isPending={retry.isPending && retry.variables?.actionId === retryTarget.actionId}
                onClick={() => retry.mutate(retryTarget)}
              >
                <RefreshCwIcon /> Retry CRM update
              </ActionButtonWithPending>
            ) : null}
            {entityLink ? (
              <Link
                href={entityLink.href}
                className={cn(buttonVariants({ variant: retryTarget ? "ghost" : "outline", size: "sm" }))}
              >
                {entityLink.label}
              </Link>
            ) : null}
            {canManage ? (
              <>
                <ActionButtonWithPending
                  variant="ghost"
                  size="sm"
                  isPending={resolve.isPending && resolve.variables === alert.id}
                  onClick={() => resolve.mutate(alert.id)}
                >
                  Mark as resolved
                </ActionButtonWithPending>
                <ActionButtonWithPending
                  variant="ghost"
                  size="sm"
                  isPending={dismiss.isPending && dismiss.variables === alert.id}
                  onClick={() => dismiss.mutate(alert.id)}
                >
                  Dismiss
                </ActionButtonWithPending>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
};
