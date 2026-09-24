"use client";

import { useState, type FC } from "react";
import { CalendarClockIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduledCallSourceFilterOptions } from "@/config/constants/dropdowns/calls/scheduled-call-source-filter.options";
import { ScheduledCallTabFormOptions } from "@/config/constants/dropdowns/calls/scheduled-call-tab-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetCallFilterOptions } from "@/features/calls/hooks/use-calls";
import {
  useCallScheduledCallNow,
  useCancelScheduledCall,
  useGetScheduledCallCounts,
  useGetScheduledCalls,
} from "@/features/scheduled-calls/hooks/use-scheduled-calls";
import {
  ScheduledCallTabs,
  ScheduledCallTabStatuses,
  type ScheduledCall,
  type ScheduledCallSource,
  type ScheduledCallTab,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { formatNumber } from "@/lib/format";
import { CallsSections, CallsSubnav } from "@/views/calls/components/calls-subnav";
import { useDebouncedValue } from "@/views/calls/hooks/use-debounced-value";
import { CallingHoursNotice } from "./components/calling-hours-notice";
import { RescheduleCallDialog } from "./components/reschedule-call-dialog";
import { ScheduleCallDialog } from "./components/schedule-call-dialog";
import { ScheduledCallsTable } from "./components/scheduled-calls-table";

const PAGE_SIZE = 20;

const ScheduledCallsPage: FC = () => {
  const { can } = usePermissions();
  const canManage = can(Permissions.SCHEDULING_MANAGE);

  const [tab, setTab] = useState<ScheduledCallTab>(ScheduledCallTabs.PENDING);
  const [search, setSearch] = useState("");
  const [agentId, setAgentId] = useState("");
  const [source, setSource] = useState<ScheduledCallSource | "all">("all");
  const [page, setPage] = useState(1);
  const [isScheduling, setIsScheduling] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduledCall | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduledCall | null>(null);
  const [callNowTarget, setCallNowTarget] = useState<ScheduledCall | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const hasActiveFilters = !!search || !!agentId || source !== "all";

  const counts = useGetScheduledCallCounts();
  const filterOptions = useGetCallFilterOptions();
  const scheduledCalls = useGetScheduledCalls({
    page,
    limit: PAGE_SIZE,
    status: ScheduledCallTabStatuses[tab].join(","),
    search: debouncedSearch || undefined,
    agent_uuid: agentId || undefined,
    source,
    // Upcoming calls soonest first; history newest first.
    order_direction: tab === ScheduledCallTabs.PENDING ? "asc" : "desc",
  });
  const callNow = useCallScheduledCallNow();
  const cancel = useCancelScheduledCall();

  const changeTab = (next: ScheduledCallTab) => {
    setTab(next);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAgentId("");
    setSource("all");
    setPage(1);
  };

  const panel = scheduledCalls.isPending ? (
    <TableSkeleton rows={8} columns={6} />
  ) : scheduledCalls.isError ? (
    <ErrorState
      title="Could not load scheduled calls"
      message={scheduledCalls.error.message}
      onRetry={() => scheduledCalls.refetch()}
    />
  ) : scheduledCalls.data.data.length === 0 ? (
    hasActiveFilters ? (
      <EmptyState
        icon={CalendarClockIcon}
        title="No scheduled calls match these filters"
        action={
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={CalendarClockIcon}
        title={
          tab === ScheduledCallTabs.PENDING
            ? "Nothing is scheduled"
            : tab === ScheduledCallTabs.COMPLETED
              ? "No completed scheduled calls yet"
              : "Nothing canceled or skipped"
        }
        description={
          tab === ScheduledCallTabs.PENDING
            ? "Schedule a call, or let an agent's follow-up rules queue them for you."
            : "Calls that were placed from a schedule will appear here."
        }
        action={
          tab === ScheduledCallTabs.PENDING && canManage ? (
            <Button onClick={() => setIsScheduling(true)}>
              <PlusIcon data-icon="inline-start" /> Schedule call
            </Button>
          ) : undefined
        }
      />
    )
  ) : (
    <div className="flex flex-col gap-3">
      <ScheduledCallsTable
        tab={tab}
        scheduledCalls={scheduledCalls.data.data}
        canManage={canManage}
        onCallNow={setCallNowTarget}
        onReschedule={setRescheduleTarget}
        onCancel={setCancelTarget}
      />
      <PaginationControls pagination={scheduledCalls.data.pagination} onPageChange={setPage} noun="scheduled calls" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Scheduled calls"
        description="Who your agents will call next and when. Calls are only placed within your company's calling hours."
        actions={
          canManage ? (
            <Button onClick={() => setIsScheduling(true)}>
              <PlusIcon data-icon="inline-start" /> Schedule call
            </Button>
          ) : null
        }
      />

      <CallsSubnav active={CallsSections.SCHEDULED} />

      <CallingHoursNotice showSettingsLink />

      <Tabs value={tab} onValueChange={(value) => changeTab(value as ScheduledCallTab)} className="gap-4">
        <TabsList variant="line" className="h-auto max-w-full overflow-x-auto">
          {ScheduledCallTabFormOptions.map((option) => (
            <TabsTrigger key={option.id} value={option.id} className="flex-none px-3 py-1.5">
              {option.label}
              {counts.data ? (
                <span className="rounded-full bg-secondary px-2 py-px text-xs font-semibold text-muted-foreground tabular-nums">
                  {formatNumber(counts.data[option.id])}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <div role="search" className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-60 flex-1 basis-64">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search contact or phone number"
              aria-label="Search contact"
              className="pl-8"
            />
          </div>
          <NativeSelect
            className="w-full sm:w-auto"
            aria-label="Agent"
            value={agentId}
            onChange={(event) => {
              setAgentId(event.target.value);
              setPage(1);
            }}
          >
            <NativeSelectOption value="">All agents</NativeSelectOption>
            {filterOptions.data?.agents.map((agent) => (
              <NativeSelectOption key={agent.id} value={agent.id}>
                {agent.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            className="w-full sm:w-auto"
            aria-label="Source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value as ScheduledCallSource | "all");
              setPage(1);
            }}
          >
            {ScheduledCallSourceFilterOptions.map((option) => (
              <NativeSelectOption key={option.id} value={option.id}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <TabsContent value={tab}>{panel}</TabsContent>
      </Tabs>

      <ScheduleCallDialog open={isScheduling} onOpenChange={setIsScheduling} />
      <RescheduleCallDialog scheduledCall={rescheduleTarget} onClose={() => setRescheduleTarget(null)} />

      <ConfirmationDialog
        open={callNowTarget !== null}
        onOpenChange={(open) => !open && setCallNowTarget(null)}
        title="Call now?"
        description={`${callNowTarget?.agent.name ?? "The agent"} will call ${callNowTarget?.contact.name ?? callNowTarget?.contact.phone ?? "this contact"} within a minute, if your calling hours allow it.`}
        confirmLabel="Call now"
        variant="default"
        isPending={callNow.isPending}
        onConfirm={() => (callNowTarget ? callNow.mutateAsync(callNowTarget.id) : undefined)}
      />

      <ConfirmationDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this scheduled call?"
        description={`${cancelTarget?.contact.name ?? cancelTarget?.contact.phone ?? "This contact"} will not be called by ${cancelTarget?.agent.name ?? "the agent"} at the planned time.`}
        confirmLabel="Cancel call"
        isPending={cancel.isPending}
        onConfirm={() => (cancelTarget ? cancel.mutateAsync(cancelTarget.id) : undefined)}
      />
    </div>
  );
};

export default ScheduledCallsPage;
