"use client";

import type { FC, ReactNode } from "react";
import { HistoryIcon, LockIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetActivityActors, useGetActivityLog } from "@/features/activity-log/hooks/use-activity-log";
import { usePermissions } from "@/hooks/use-permissions";
import { ActivityFilters } from "@/views/activity-log/components/activity-filters";
import { ActivityTable } from "@/views/activity-log/components/activity-table";
import { useActivityFilters } from "@/views/activity-log/hooks/use-activity-filters";
import { SettingsNav } from "@/views/settings/components/settings-nav";

/** The activity log lives under Settings, so it shares the settings header and sub-navigation. */
const SettingsFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
    <PageHeader
      title="Settings"
      description="Manage your company account, team and how agents are allowed to call."
    />
    <SettingsNav />
    {children}
  </div>
);

const ActivityLogPage: FC = () => {
  const { can } = usePermissions();
  const canRead = can(Permissions.ACTIVITY_READ);
  const filters = useActivityFilters();
  const log = useGetActivityLog(filters.query, canRead && filters.isRangeValid);
  const actors = useGetActivityActors(canRead);

  if (!canRead) {
    return (
      <SettingsFrame>
        <EmptyState
          icon={LockIcon}
          title="You do not have access to the activity log"
          description="Ask an owner or admin of your company if you need to see who did what."
        />
      </SettingsFrame>
    );
  }

  return (
    <SettingsFrame>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-medium">Activity log</h3>
          <p className="text-sm text-muted-foreground">
            A clear history of what happened in your company and who did it.
          </p>
        </div>

        <ActivityFilters
          search={filters.search}
          onSearchChange={filters.setSearch}
          actor={filters.actor}
          onActorChange={filters.setActor}
          people={actors.data ?? []}
          entityGroup={filters.entityGroup}
          onEntityGroupChange={filters.setEntityGroup}
          period={filters.period}
          onPeriodChange={filters.setPeriod}
          isCustom={filters.isCustom}
          from={filters.from}
          to={filters.to}
          onFromChange={filters.setFrom}
          onToChange={filters.setTo}
          isRangeValid={filters.isRangeValid}
        />

        {!filters.isRangeValid ? null : log.isError ? (
          <ErrorState
            title="Could not load the activity log"
            message={log.error.message}
            onRetry={() => log.refetch()}
          />
        ) : log.isPending ? (
          <TableSkeleton rows={10} columns={5} />
        ) : log.data.data.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No activity found"
            description="Nothing matches these filters. Try a wider date range or clear the search."
          />
        ) : (
          <>
            <ActivityTable entries={log.data.data} />
            <PaginationControls pagination={log.data.pagination} onPageChange={filters.setPage} noun="entries" />
          </>
        )}
      </section>
    </SettingsFrame>
  );
};

export default ActivityLogPage;
