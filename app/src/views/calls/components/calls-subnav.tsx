"use client";

import type { FC } from "react";
import Link from "next/link";
import { useGetScheduledCallCounts } from "@/features/scheduled-calls/hooks/use-scheduled-calls";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

export const CallsSections = {
  ALL: "all",
  SCHEDULED: "scheduled",
} as const;
export type CallsSection = (typeof CallsSections)[keyof typeof CallsSections];

interface CallsSubnavProps {
  active: CallsSection;
}

const linkClass = (isActive: boolean) =>
  cn(
    "relative -mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
    isActive
      ? "border-foreground text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );

/** All calls / Scheduled switch shared by both calls pages. */
export const CallsSubnav: FC<CallsSubnavProps> = ({ active }) => {
  const counts = useGetScheduledCallCounts();

  return (
    <nav aria-label="Calls sections" className="flex gap-1 overflow-x-auto border-b border-border">
      <Link
        href={Routes.calls.root}
        aria-current={active === CallsSections.ALL ? "page" : undefined}
        className={linkClass(active === CallsSections.ALL)}
      >
        All calls
      </Link>
      <Link
        href={Routes.calls.scheduled}
        aria-current={active === CallsSections.SCHEDULED ? "page" : undefined}
        className={linkClass(active === CallsSections.SCHEDULED)}
      >
        Scheduled
        {counts.data ? (
          <span className="rounded-full bg-secondary px-2 py-px text-xs font-semibold text-muted-foreground tabular-nums">
            {counts.data.pending}
          </span>
        ) : null}
      </Link>
    </nav>
  );
};
