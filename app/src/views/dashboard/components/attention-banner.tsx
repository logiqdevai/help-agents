"use client";

import type { FC } from "react";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AlertTypeFormOptions } from "@/config/constants/dropdowns/alerts/alert-type-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAlertsSummary } from "@/features/alerts/hooks/use-alerts";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

/** Errors are surfaced, never silent (spec §33): shown while any alert is open. */
export const AttentionBanner: FC = () => {
  const { can } = usePermissions();
  const { data } = useGetAlertsSummary(can(Permissions.ALERTS_READ));

  if (!data || data.open_total === 0) return null;

  const breakdown = data.by_type
    .map(({ type, count }) => `${count} ${getDropdownOptionLabel(AlertTypeFormOptions, type).toLowerCase()}`)
    .join(", ");

  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3.5 text-sm"
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-relaxed">
        <span className="font-medium">
          {data.open_total === 1 ? "1 thing needs" : `${data.open_total} things need`} your attention.
        </span>{" "}
        <span className="text-muted-foreground">{breakdown}.</span>
      </p>
      <Link href={Routes.alerts} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        Review alerts
      </Link>
    </div>
  );
};
