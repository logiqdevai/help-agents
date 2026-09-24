"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenIcon, PlusIcon, SearchIcon } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SelectField } from "@/components/ui/select-field";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { KnowledgeStatusFilterOptions } from "@/config/constants/dropdowns/knowledge/knowledge-status-filter.options";
import { KnowledgeTypeFilterOptions } from "@/config/constants/dropdowns/knowledge/knowledge-type-filter.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetKnowledgeSources } from "@/features/knowledge/hooks/use-knowledge";
import {
  KnowledgeStatusFilters,
  type KnowledgeSourceType,
  type KnowledgeStatusFilter,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { useGetAgentOptions } from "@/features/phone-numbers/hooks/use-agent-options";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { ConnectorsComingSoon } from "./components/connectors-coming-soon";
import { KnowledgeStats } from "./components/knowledge-stats";
import { KnowledgeTable } from "./components/knowledge-table";
import { useDebouncedValue } from "./hooks/use-debounced-value";

const PAGE_SIZE = 20;

const KnowledgePage: FC = () => {
  const { can } = usePermissions();
  const canWrite = can(Permissions.KNOWLEDGE_WRITE);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<KnowledgeStatusFilter | "all">("all");
  const [type, setType] = useState<KnowledgeSourceType | "all">("all");
  const [agent, setAgent] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const agents = useGetAgentOptions();
  const agentOptions = useMemo(
    () => [{ id: "all", label: "All agents" }, ...(agents.data ?? []).map((option) => ({ id: option.id, label: option.name }))],
    [agents.data],
  );
  const sources = useGetKnowledgeSources({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim(),
    status: status === KnowledgeStatusFilters.DISABLED ? "all" : status,
    is_enabled: status === KnowledgeStatusFilters.DISABLED ? false : undefined,
    type,
    agent_uuid: agent,
  });

  const hasFilters = search !== "" || status !== "all" || type !== "all" || agent !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setAgent("all");
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Knowledge"
        description="Everything your agents can draw on to answer questions correctly: pricing, policies, FAQs, product details and scripts. Add it once, share it with any agent."
        actions={
          canWrite ? (
            <Link href={Routes.knowledge.create} className={buttonVariants()}>
              <PlusIcon aria-hidden="true" />
              Add knowledge
            </Link>
          ) : null
        }
      />

      <KnowledgeStats />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-8"
            placeholder="Search knowledge sources"
            aria-label="Search knowledge sources"
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
          options={KnowledgeStatusFilterOptions}
        />
        <SelectField
          aria-label="Filter by type"
          value={type}
          onValueChange={(value) => {
            setType(value);
            setPage(1);
          }}
          options={KnowledgeTypeFilterOptions}
        />
        <SelectField
          aria-label="Filter by agent"
          value={agent}
          onValueChange={(value) => {
            setAgent(value);
            setPage(1);
          }}
          options={agentOptions}
        />
      </div>

      {sources.isPending ? <TableSkeleton rows={6} columns={8} /> : null}

      {sources.isError ? (
        <ErrorState
          title="Could not load knowledge"
          message={sources.error.message}
          onRetry={() => sources.refetch()}
        />
      ) : null}

      {sources.data && sources.data.data.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchIcon}
            title="No knowledge matches these filters"
            description="Try a different search, or clear the filters to see everything."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpenIcon}
            title="No knowledge yet"
            description="Add your pricing, policies and FAQs so agents can answer questions correctly."
            action={
              canWrite ? (
                <Link href={Routes.knowledge.create} className={buttonVariants()}>
                  <PlusIcon aria-hidden="true" />
                  Add knowledge
                </Link>
              ) : undefined
            }
          />
        )
      ) : null}

      {sources.data && sources.data.data.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <KnowledgeTable sources={sources.data.data} canWrite={canWrite} />
          </div>
          <PaginationControls pagination={sources.data.pagination} onPageChange={setPage} noun="sources" />
          <p className="text-sm text-muted-foreground">
            Turning a source off keeps it, but agents stop using it.
          </p>
        </div>
      ) : null}

      <ConnectorsComingSoon />
    </div>
  );
};

export default KnowledgePage;
