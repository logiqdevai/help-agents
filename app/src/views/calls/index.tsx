"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { CalendarClockIcon, FlaskConicalIcon, PhoneCallIcon, PhoneIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetCallFilterOptions, useGetCalls } from "@/features/calls/hooks/use-calls";
import { usePermissions } from "@/hooks/use-permissions";
import { formatNumber } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { CallDialog, CallDialogVariants, type CallDialogVariant } from "./components/call-dialog";
import { CallsFilters } from "./components/calls-filters";
import { CallsSections, CallsSubnav } from "./components/calls-subnav";
import { CallsTable } from "./components/calls-table";
import { useCallsFilters } from "./hooks/use-calls-filters";

const CallsPage: FC = () => {
  const { can } = usePermissions();
  const { filters, setFilter, reset, query, setPage, hasActiveFilters } = useCallsFilters();
  const calls = useGetCalls(query);
  const filterOptions = useGetCallFilterOptions();
  const [dialog, setDialog] = useState<CallDialogVariant | null>(null);

  const canPlace = can(Permissions.CALLS_PLACE);
  const canSchedule = can(Permissions.SCHEDULING_READ);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calls"
        description="Every call made or received through the platform, with its outcome and cost."
        actions={
          <>
            {canPlace ? (
              <>
                <Button variant="outline" onClick={() => setDialog(CallDialogVariants.TEST)}>
                  <FlaskConicalIcon data-icon="inline-start" /> Test call
                </Button>
                <Button variant="outline" onClick={() => setDialog(CallDialogVariants.LIVE)}>
                  <PhoneIcon data-icon="inline-start" /> Place call
                </Button>
              </>
            ) : null}
            {canSchedule ? (
              <Link href={Routes.calls.scheduled} className={buttonVariants()}>
                <CalendarClockIcon data-icon="inline-start" /> Schedule call
              </Link>
            ) : null}
          </>
        }
      />

      <CallsSubnav active={CallsSections.ALL} />

      <CallsFilters filters={filters} options={filterOptions.data} onChange={setFilter} />

      {calls.isPending ? (
        <TableSkeleton rows={10} columns={7} />
      ) : calls.isError ? (
        <ErrorState title="Could not load calls" message={calls.error.message} onRetry={() => calls.refetch()} />
      ) : calls.data.data.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={PhoneCallIcon}
            title="No calls match these filters"
            description="Try a wider date range or clear a filter."
            action={
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={PhoneCallIcon}
            title="No calls yet"
            description="Calls your agents make or receive will show up here with their outcome and cost."
            action={
              canPlace ? (
                <Button onClick={() => setDialog(CallDialogVariants.TEST)}>
                  <FlaskConicalIcon data-icon="inline-start" /> Try a test call
                </Button>
              ) : undefined
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {formatNumber(calls.data.pagination.total)}{" "}
            {calls.data.pagination.total === 1 ? "call" : "calls"} {hasActiveFilters ? "match" : "in total"}
          </p>
          <CallsTable calls={calls.data.data} />
          <PaginationControls pagination={calls.data.pagination} onPageChange={setPage} noun="calls" />
        </div>
      )}

      <CallDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        variant={dialog ?? CallDialogVariants.TEST}
      />
    </div>
  );
};

export default CallsPage;
