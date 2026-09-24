import type { FC } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { OrbCard, OrbTones } from "@/components/ui/orb-card";
import type { DashboardCosts } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatMoney } from "@/lib/format";
import { Routes } from "@/routes/routes";

interface EstimatedCostCardProps {
  costs: DashboardCosts;
}

export const EstimatedCostCard: FC<EstimatedCostCardProps> = ({ costs }) => {
  const { month_to_date: month } = costs;

  return (
    <OrbCard
      orbs={[
        { tone: OrbTones.MINT, className: "-top-16 -right-14 size-64" },
        { tone: OrbTones.LAVENDER, className: "-right-6 -bottom-28 size-56" },
      ]}
    >
      <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">Estimated cost</p>
      <p className="mt-2 font-display text-4xl leading-none font-light tracking-tight tabular-nums">
        {formatMoney(month.total_cost, costs.currency)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Month to date · projected {formatMoney(month.projected_total_cost, costs.currency)} by{" "}
        {format(parseISO(month.month_end), "d MMM")}
      </p>
      <Link
        href={Routes.analytics}
        className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
      >
        Open usage reports →
      </Link>
    </OrbCard>
  );
};
