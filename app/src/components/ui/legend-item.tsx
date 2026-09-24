import * as React from "react"

import { cn } from "@/lib/utils"

export const LegendTones = {
  INK: "ink",
  MUTED: "muted",
  LINE: "line",
} as const
export type LegendTone = (typeof LegendTones)[keyof typeof LegendTones]

// Same colors the charts and bar lists use, so the legend always matches the marks.
const swatchClasses: Record<LegendTone, string> = {
  ink: "size-2.5 rounded-[3px] bg-primary",
  muted: "size-2.5 rounded-[3px] bg-hairline-strong dark:bg-muted-ink",
  line: "h-0.5 w-3.5 rounded-full bg-muted-soft",
}

/** Color key for a chart or bar list: a small swatch followed by the series name. */
function LegendItem({ tone, children }: { tone: LegendTone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <span aria-hidden="true" className={cn("inline-block shrink-0", swatchClasses[tone])} />
      {children}
    </span>
  )
}

export { LegendItem }
