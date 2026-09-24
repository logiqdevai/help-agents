"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { BotIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { AgentStatusFilterOptions } from "@/config/constants/dropdowns/agents/agent-status-filter.options";
import {
  AgentViewFormOptions,
  AgentViews,
  type AgentView,
} from "@/config/constants/dropdowns/agents/agent-view-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgents } from "@/features/agents/hooks/use-agents";
import type { AgentStatus } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { AgentCard } from "./components/agent-card";
import { AgentTemplates } from "./components/agent-templates";
import { AgentsTable } from "./components/agents-table";

const PAGE_SIZE = 12;

const CardsSkeleton: FC = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} className="h-72 rounded-xl" />
    ))}
  </div>
);

const AgentsPage: FC = () => {
  const { can } = usePermissions();
  const canWrite = can(Permissions.AGENTS_WRITE);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AgentStatus | "all">("all");
  const [view, setView] = useState<AgentView>(AgentViews.CARDS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const agents = useGetAgents({ page, limit: PAGE_SIZE, search: debouncedSearch.trim(), status });

  const hasFilters = search !== "" || status !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const createButton = canWrite ? (
    <Link href={Routes.agents.create} className={buttonVariants()}>
      <PlusIcon aria-hidden="true" />
      Create agent
    </Link>
  ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Agents"
        description="Each agent has its own job, voice, phone number, CRM connection and knowledge. Create as many as you need."
        actions={createButton}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-8"
            placeholder="Search agents by name or purpose"
            aria-label="Search agents"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <SelectField
          aria-label="Filter by status"
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={AgentStatusFilterOptions}
        />
        <SegmentedControl aria-label="View" value={view} onValueChange={setView} options={AgentViewFormOptions} />
      </div>

      {agents.isPending ? view === AgentViews.CARDS ? <CardsSkeleton /> : <TableSkeleton rows={6} columns={7} /> : null}

      {agents.isError ? (
        <ErrorState title="Could not load agents" message={agents.error.message} onRetry={() => agents.refetch()} />
      ) : null}

      {agents.data && agents.data.data.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchIcon}
            title="No agents match your filters"
            description="Try a different search term or clear the status filter."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BotIcon}
            title="No agents yet"
            description="A guided setup takes you from basics to a live test call. You can also start from one of the use cases below."
            action={createButton ?? undefined}
          />
        )
      ) : null}

      {agents.data && agents.data.data.length > 0 ? (
        <div className="flex flex-col gap-4">
          {view === AgentViews.CARDS ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.data.data.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <AgentsTable agents={agents.data.data} />
          )}
          <PaginationControls pagination={agents.data.pagination} onPageChange={setPage} noun="agents" />
        </div>
      ) : null}

      {canWrite ? <AgentTemplates /> : null}
    </div>
  );
};

export default AgentsPage;
