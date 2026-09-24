"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Permissions } from "@/config/constants/permissions";
import { useGetAlertsSummary } from "@/features/alerts/hooks/use-alerts";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const MAX_DISPLAYED_COUNT = 99;

/** Top-bar bell: links to the alerts page and shows how many alerts are still open. */
export function AlertsBell() {
  const { can } = usePermissions();
  const canRead = can(Permissions.ALERTS_READ);
  const { data } = useGetAlertsSummary(canRead);

  if (!canRead) return null;

  const open = data?.open_total ?? 0;
  const label = open === 0 ? "Alerts" : `Alerts, ${open} open`;

  return (
    <Link
      href={Routes.alerts}
      aria-label={label}
      title={label}
      className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "relative")}
    >
      <BellIcon />
      {open > 0 ? (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white tabular-nums"
        >
          {open > MAX_DISPLAYED_COUNT ? `${MAX_DISPLAYED_COUNT}+` : open}
        </span>
      ) : null}
    </Link>
  );
}
