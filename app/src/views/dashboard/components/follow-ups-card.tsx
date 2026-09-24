import type { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { ScheduledCallSourceFormOptions } from "@/config/constants/dropdowns/calls/scheduled-call-source-form.options";
import type { DashboardResponse } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { ScheduledCallSources } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { formatFollowUpTime } from "@/views/dashboard/utils/format-follow-up-time";

const VISIBLE_ITEMS = 4;

interface FollowUpsCardProps {
  followUps: DashboardResponse["pending_follow_ups"];
}

export const FollowUpsCard: FC<FollowUpsCardProps> = ({ followUps }) => (
  <SectionCard
    title="Pending follow-ups"
    flush
    actions={
      <Link href={Routes.calls.scheduled} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Scheduled calls
      </Link>
    }
    footer={
      followUps.total > 0 ? (
        <span className="flex items-center justify-between gap-3">
          <span>{followUps.total} pending in total</span>
          <Link href={Routes.calls.scheduled} className="font-medium text-foreground underline-offset-4 hover:underline">
            See all
          </Link>
        </span>
      ) : undefined
    }
  >
    {followUps.items.length === 0 ? (
      <p className="px-6 py-10 text-center text-sm text-muted-foreground">
        No follow-ups are waiting. Retries and callbacks show up here.
      </p>
    ) : (
      <ul>
        {followUps.items.slice(0, VISIBLE_ITEMS).map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 border-b border-border px-6 py-3.5 last:border-b-0">
            <span
              aria-hidden="true"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium"
            >
              {initialsOf(item.contact.name ?? item.contact.phone)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.contact.name ?? item.contact.phone ?? "Unknown contact"}</p>
              <p className="truncate text-sm text-muted-foreground">
                {item.agent.name}
                {item.source === ScheduledCallSources.RETRY ? ` · attempt ${item.attempt_number}` : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium tabular-nums">{formatFollowUpTime(item.scheduled_for)}</p>
              <p className="text-muted-foreground">{getDropdownOptionLabel(ScheduledCallSourceFormOptions, item.source)}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
);
