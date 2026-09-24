"use client";

import type { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetKnowledgeStats } from "@/features/knowledge/hooks/use-knowledge";
import { formatNumber } from "@/lib/format";

/** One-line overview above the list. Non-essential, so it renders nothing if the totals cannot be loaded. */
export const KnowledgeStats: FC = () => {
  const stats = useGetKnowledgeStats();

  if (stats.isPending) return <Skeleton className="h-5 w-96 max-w-full" />;
  if (!stats.data) return null;

  const { total, ready, processing, failed, disabled } = stats.data;
  const items = [
    { value: total, label: total === 1 ? "source" : "sources" },
    { value: ready, label: "ready and in use" },
    { value: processing, label: "processing" },
    { value: failed, label: "failed" },
    { value: disabled, label: "turned off" },
  ];

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex gap-1.5">
          <dt className="font-medium text-foreground tabular-nums">{formatNumber(item.value)}</dt>
          <dd>{item.label}</dd>
        </div>
      ))}
    </dl>
  );
};
