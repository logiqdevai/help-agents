import type { FC } from "react";
import { OrbCard, OrbTones } from "@/components/ui/orb-card";
import { Separator } from "@/components/ui/separator";
import type { UsageTotals } from "@/features/analytics/interfaces/analytics.interfaces";
import { formatNumber, formatPercent } from "@/lib/format";

interface SuccessRateCardProps {
  totals: UsageTotals;
}

export const SuccessRateCard: FC<SuccessRateCardProps> = ({ totals }) => {
  const rows = [
    { label: "Completed", value: totals.completed_calls - totals.transferred_calls },
    { label: "Transferred to a person", value: totals.transferred_calls },
    { label: "No answer / busy", value: totals.no_answer_calls },
    { label: "Failed", value: totals.failed_calls },
  ];

  return (
    <OrbCard
      className="p-7"
      orbs={[
        { tone: OrbTones.PEACH, className: "-top-16 -right-16 size-64" },
        { tone: OrbTones.SKY, className: "-bottom-28 -left-16 size-56" },
      ]}
    >
      <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">Success rate</p>
      <p className="mt-2 font-display text-5xl leading-none font-light tracking-tight tabular-nums">
        {formatPercent(totals.success_rate)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatNumber(totals.successful_calls)} of {formatNumber(totals.total_calls)} calls reached an outcome marked
        as successful.
      </p>
      <Separator className="my-5" />
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium tabular-nums">{formatNumber(row.value)}</dd>
          </div>
        ))}
      </dl>
    </OrbCard>
  );
};
