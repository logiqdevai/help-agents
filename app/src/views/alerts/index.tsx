"use client";

import { useState, type FC } from "react";
import { BellIcon, CheckIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SelectField } from "@/components/ui/select-field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertStatusFormOptions } from "@/config/constants/dropdowns/alerts/alert-status-form.options";
import { AlertTypeFilterOptions } from "@/config/constants/dropdowns/alerts/alert-type-filter.options";
import { Permissions } from "@/config/constants/permissions";
import { useDismissAllAlerts, useGetAlerts, useGetAlertsSummary } from "@/features/alerts/hooks/use-alerts";
import {
  AlertStatuses,
  type AlertStatus,
  type AlertType,
} from "@/features/alerts/interfaces/alerts.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { AlertItem } from "@/views/alerts/components/alert-item";
import { AlertsListSkeleton } from "@/views/alerts/components/alerts-list-skeleton";
import { RetryScheduleCard } from "@/views/alerts/components/retry-schedule-card";

const PAGE_SIZE = 10;

const emptyMessages: Record<AlertStatus, { title: string; description: string }> = {
  [AlertStatuses.OPEN]: {
    title: "All clear",
    description: "Nothing needs your attention right now. Problems with calls, connections or CRM updates show up here.",
  },
  [AlertStatuses.RESOLVED]: {
    title: "No resolved alerts",
    description: "Alerts that get fixed, automatically or by you, are kept here.",
  },
  [AlertStatuses.DISMISSED]: {
    title: "No dismissed alerts",
    description: "Alerts you dismiss are kept here.",
  },
};

const AlertsPage: FC = () => {
  const { can } = usePermissions();
  const [status, setStatus] = useState<AlertStatus>(AlertStatuses.OPEN);
  const [type, setType] = useState<AlertType | "all">("all");
  const [page, setPage] = useState(1);
  const [confirmDismissAll, setConfirmDismissAll] = useState(false);

  const alerts = useGetAlerts({ status, type, page, limit: PAGE_SIZE });
  const summary = useGetAlertsSummary();
  const dismissAll = useDismissAllAlerts();

  const counts: Record<AlertStatus, number | undefined> = {
    [AlertStatuses.OPEN]: summary.data?.by_status.open,
    [AlertStatuses.RESOLVED]: summary.data?.by_status.resolved,
    [AlertStatuses.DISMISSED]: summary.data?.by_status.dismissed,
  };
  const canDismissAll = can(Permissions.ALERTS_MANAGE) && status === AlertStatuses.OPEN && (alerts.data?.data.length ?? 0) > 0;
  const typeLabel = getDropdownOptionLabel(AlertTypeFilterOptions, type).toLowerCase();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Alerts"
        description="Anything that went wrong is shown here, never hidden. Your calls and their results are always saved, even when a follow-up step fails."
        actions={
          canDismissAll ? (
            <ActionButtonWithPending
              variant="outline"
              size="lg"
              isPending={dismissAll.isPending}
              onClick={() => setConfirmDismissAll(true)}
            >
              <CheckIcon /> Dismiss all
            </ActionButtonWithPending>
          ) : null
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 pr-6">
            <Tabs
              value={status}
              onValueChange={(value) => {
                setStatus(value as AlertStatus);
                setPage(1);
              }}
            >
              <TabsList variant="line" className="group-data-horizontal/tabs:h-11">
                {AlertStatusFormOptions.map((option) => (
                  <TabsTrigger key={option.id} value={option.id} className="px-3">
                    {option.label}
                    {counts[option.id] !== undefined ? (
                      <span className="rounded-full bg-secondary px-1.5 text-xs font-semibold text-muted-foreground tabular-nums">
                        {counts[option.id]}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <SelectField
              size="sm"
              aria-label="Filter by alert type"
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
              options={AlertTypeFilterOptions}
            />
          </div>

          {alerts.isError ? (
            <div className="p-6">
              <ErrorState title="Could not load alerts" message={alerts.error.message} onRetry={() => alerts.refetch()} />
            </div>
          ) : alerts.isPending ? (
            <AlertsListSkeleton />
          ) : alerts.data.data.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={BellIcon}
                title={type === "all" ? emptyMessages[status].title : `No ${typeLabel} alerts`}
                description={type === "all" ? emptyMessages[status].description : "Try another alert type."}
              />
            </div>
          ) : (
            <ul>
              {alerts.data.data.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </ul>
          )}

          {alerts.data && alerts.data.pagination.total_pages > 1 ? (
            <div className="border-t border-border px-6 py-3">
              <PaginationControls pagination={alerts.data.pagination} onPageChange={setPage} noun="alerts" />
            </div>
          ) : null}
        </Card>

        <RetryScheduleCard />
      </div>

      <ConfirmationDialog
        open={confirmDismissAll}
        onOpenChange={setConfirmDismissAll}
        variant="default"
        title="Dismiss all open alerts?"
        description={
          type === "all"
            ? "Every open alert moves to Dismissed. The calls and results behind them stay saved."
            : `Every open ${typeLabel} alert moves to Dismissed. The calls and results behind them stay saved.`
        }
        confirmLabel="Dismiss all"
        isPending={dismissAll.isPending}
        onConfirm={() => dismissAll.mutateAsync(type === "all" ? {} : { type })}
      />
    </div>
  );
};

export default AlertsPage;
