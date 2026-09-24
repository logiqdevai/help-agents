import type { FC } from "react";
import { LegendItem, LegendTones } from "@/components/ui/legend-item";
import { SectionCard } from "@/components/ui/section-card";
import type { DashboardResponse } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatNumber, formatPercent } from "@/lib/format";

interface SuccessSplitCardProps {
  split: DashboardResponse["successful_vs_unsuccessful"];
}

export const SuccessSplitCard: FC<SuccessSplitCardProps> = ({ split }) => {
  const decided = split.successful + split.unsuccessful;
  const share = (count: number) => (decided ? formatPercent((count / decided) * 100) : "—");

  return (
    <SectionCard title="Successful vs. unsuccessful">
      <div className="flex flex-col gap-4">
        <div
          role="img"
          aria-label={`${split.successful} successful and ${split.unsuccessful} unsuccessful calls`}
          className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-secondary"
        >
          {split.successful > 0 ? <span className="bg-primary" style={{ flexGrow: split.successful }} /> : null}
          {split.unsuccessful > 0 ? (
            <span className="bg-hairline-strong dark:bg-muted-ink" style={{ flexGrow: split.unsuccessful }} />
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <LegendItem tone={LegendTones.INK}>Successful</LegendItem>
            <p className="mt-1 font-display text-2xl font-light tabular-nums">
              {formatNumber(split.successful)}{" "}
              <span className="font-sans text-sm text-muted-foreground">· {share(split.successful)}</span>
            </p>
          </div>
          <div>
            <LegendItem tone={LegendTones.MUTED}>Unsuccessful</LegendItem>
            <p className="mt-1 font-display text-2xl font-light tabular-nums">
              {formatNumber(split.unsuccessful)}{" "}
              <span className="font-sans text-sm text-muted-foreground">· {share(split.unsuccessful)}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Success is decided by the outcomes each agent marks as successful.
          {split.unknown > 0 ? ` ${formatNumber(split.unknown)} calls are still being analysed.` : ""}
        </p>
      </div>
    </SectionCard>
  );
};
