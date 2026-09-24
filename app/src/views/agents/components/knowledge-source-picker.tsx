"use client";

import type { FC } from "react";
import Link from "next/link";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { useGetKnowledgeSources } from "@/features/knowledge/hooks/use-knowledge";
import { KnowledgeStatuses, type KnowledgeSource } from "@/features/knowledge/interfaces/knowledge.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { KnowledgeStatusBadge } from "@/views/knowledge/components/knowledge-status-badge";
import { SourceTypeIcon } from "@/views/knowledge/components/source-type-icon";

const SOURCE_LIMIT = 100;

interface KnowledgeSourcePickerProps {
  /** Ids of the sources the agent may use. */
  value: string[];
  onChange: (sourceIds: string[]) => void;
  disabled?: boolean;
}

const isSelectable = (source: KnowledgeSource) =>
  source.status === KnowledgeStatuses.READY && source.is_enabled;

const availability = (source: KnowledgeSource): string | null => {
  if (source.status === KnowledgeStatuses.PROCESSING) return "Still being processed. Available once it is ready.";
  if (source.status === KnowledgeStatuses.FAILED) return "Processing failed. Fix it from Knowledge to use it.";
  if (!source.is_enabled) return "Turned off in Knowledge.";
  return null;
};

/** Checklist of the company's knowledge sources; the ones that are not ready yet cannot be added. */
export const KnowledgeSourcePicker: FC<KnowledgeSourcePickerProps> = ({ value, onChange, disabled }) => {
  const sources = useGetKnowledgeSources({ limit: SOURCE_LIMIT, order_by: "name", order_direction: "asc" });

  if (sources.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (sources.isError) {
    return (
      <ErrorState
        title="Could not load your knowledge"
        message={sources.error.message}
        onRetry={() => sources.refetch()}
      />
    );
  }

  const list = sources.data.data;

  if (list.length === 0) {
    return (
      <EmptyState
        icon={BookOpenIcon}
        title="No knowledge yet"
        description="Add your pricing, policies and FAQs so the agent can answer questions correctly."
        action={
          <Link href={Routes.knowledge.create} className={buttonVariants({ variant: "outline" })}>
            <PlusIcon aria-hidden="true" />
            Add knowledge
          </Link>
        }
      />
    );
  }

  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((sourceId) => sourceId !== id));

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {list.map((source) => {
          const selected = value.includes(source.id);
          const note = availability(source);
          // A source that stopped being usable can still be removed, but not added again.
          const locked = disabled || (!isSelectable(source) && !selected);
          const inputId = `knowledge-source-${source.id}`;
          return (
            <li key={source.id}>
              <label
                htmlFor={inputId}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  locked ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                  selected ? "border-foreground" : "border-border hover:border-hairline-strong",
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={selected}
                  disabled={locked}
                  onCheckedChange={(checked) => toggle(source.id, checked)}
                />
                <SourceTypeIcon type={source.type} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{source.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {note ??
                      `${getDropdownOptionLabel(KnowledgeSourceTypeOptions, source.type)} · version ${source.current_version} · updated ${formatDate(source.updated_at)}`}
                  </span>
                </span>
                <KnowledgeStatusBadge status={source.status} />
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {value.length} of {list.length} sources selected
        </span>
        <Link href={Routes.knowledge.create} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <PlusIcon aria-hidden="true" />
          Add knowledge
        </Link>
      </div>
    </div>
  );
};
