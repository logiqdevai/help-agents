import type { FC } from "react";
import { cn } from "@/lib/utils";

export const TrendKinds = {
  PERCENT: "percent",
  SECONDS: "seconds",
} as const;
export type TrendKind = (typeof TrendKinds)[keyof typeof TrendKinds];

interface TrendNoteProps {
  current: number;
  previous: number;
  kind?: TrendKind;
  /** What the figure is compared with: "yesterday". */
  comparedWith: string;
  /** Formats the previous figure shown in brackets ("(119)"); omit to hide it. */
  formatPrevious?: (value: number) => string;
}

/** "+7% vs. yesterday (119)" — green when up, red when down, plain when unchanged. */
export const TrendNote: FC<TrendNoteProps> = ({
  current,
  previous,
  kind = TrendKinds.PERCENT,
  comparedWith,
  formatPrevious,
}) => {
  const diff = current - previous;
  const previousLabel = formatPrevious ? ` (${formatPrevious(previous)})` : "";

  if (diff === 0) {
    return <span>No change vs. {comparedWith}{previousLabel}</span>;
  }

  // A percentage against zero is meaningless, so only the comparison base is shown.
  if (kind === TrendKinds.PERCENT && previous === 0) {
    return <span>vs. {comparedWith}{previousLabel}</span>;
  }

  const sign = diff > 0 ? "+" : "−";
  const magnitude =
    kind === TrendKinds.PERCENT ? `${Math.round((Math.abs(diff) / previous) * 100)}%` : `${Math.round(Math.abs(diff))}s`;

  return (
    <>
      <span className={cn("font-medium", diff > 0 ? "text-semantic-success" : "text-destructive")}>
        {sign}
        {magnitude}
      </span>
      <span>
        vs. {comparedWith}
        {previousLabel}
      </span>
    </>
  );
};
