"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { KnowledgeStatusFilterOptions } from "@/config/constants/dropdowns/knowledge/knowledge-status-filter.options";
import {
  KnowledgeStatusFilters,
  KnowledgeStatuses,
  type KnowledgeSource,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { useRefreshKnowledge, useUpdateKnowledge } from "@/features/knowledge/hooks/use-knowledge";
import { formatDate, formatDateTime } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";
import { KnowledgeStatusBadge } from "./knowledge-status-badge";
import { SourceTypeIcon } from "./source-type-icon";
import { UsedByAgents } from "./used-by-agents";

interface KnowledgeTableProps {
  sources: KnowledgeSource[];
  canWrite: boolean;
}

export const KnowledgeTable: FC<KnowledgeTableProps> = ({ sources, canWrite }) => {
  const router = useRouter();
  const update = useUpdateKnowledge();
  const refresh = useRefreshKnowledge();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>In use</TableHead>
          <TableHead>Used by</TableHead>
          <TableHead>Added</TableHead>
          <TableHead>Last updated</TableHead>
          <TableHead>Refreshed</TableHead>
          <TableHead className="pr-4 text-right">Version</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sources.map((source) => {
          const isFailed = source.status === KnowledgeStatuses.FAILED;
          const isToggling = update.isPending && update.variables?.id === source.id;
          const isRetrying = refresh.isPending && refresh.variables === source.id;
          return (
            <TableRow
              key={source.id}
              className="cursor-pointer"
              onClick={() => router.push(Routes.knowledge.detail(source.id))}
            >
              <TableCell className="min-w-56 py-3 pl-4">
                <div className={cn("flex items-center gap-3", !source.is_enabled && "opacity-60")}>
                  <SourceTypeIcon type={source.type} />
                  <div className="min-w-0">
                    <Link
                      href={Routes.knowledge.detail(source.id)}
                      className="block truncate font-medium text-foreground hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {source.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {getDropdownOptionLabel(KnowledgeSourceTypeOptions, source.type)}
                      {source.is_enabled
                        ? null
                        : ` · ${getDropdownOptionLabel(KnowledgeStatusFilterOptions, KnowledgeStatusFilters.DISABLED).toLowerCase()}`}
                    </span>
                    {isFailed && source.last_error ? (
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
                        <CircleAlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
                        {source.last_error}
                      </span>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-2">
                  <KnowledgeStatusBadge status={source.status} />
                  {isFailed && canWrite ? (
                    <ActionButtonWithPending
                      variant="outline"
                      size="sm"
                      isPending={isRetrying}
                      onClick={(event) => {
                        event.stopPropagation();
                        refresh.mutate(source.id);
                      }}
                    >
                      Retry
                    </ActionButtonWithPending>
                  ) : null}
                </div>
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Switch
                  aria-label={`Let agents use ${source.name}`}
                  checked={source.is_enabled}
                  disabled={!canWrite || isToggling}
                  onCheckedChange={(checked) => update.mutate({ id: source.id, dto: { is_enabled: checked } })}
                />
              </TableCell>
              <TableCell className={cn(!source.is_enabled && "opacity-60")}>
                <UsedByAgents agents={source.used_by} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(source.created_at)}
                <span className="block text-xs text-muted-foreground">{source.added_by?.name ?? "—"}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDateTime(source.updated_at)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {source.status === KnowledgeStatuses.PROCESSING ? (
                  <span className="text-muted-foreground">In progress…</span>
                ) : source.last_refreshed_at ? (
                  formatDateTime(source.last_refreshed_at)
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell className="pr-4 text-right tabular-nums">v{source.current_version}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
