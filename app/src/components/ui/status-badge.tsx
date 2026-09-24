import * as React from "react"

import { cn } from "@/lib/utils"

export const StatusTones = {
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
  NEUTRAL: "neutral",
} as const
export type StatusTone = (typeof StatusTones)[keyof typeof StatusTones]

// Colors only — display text is resolved by the caller from config/constants/dropdowns/.
const toneClasses: Record<StatusTone, string> = {
  success: "bg-semantic-success/10 text-semantic-success",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-gradient-sky/40 text-ink",
  neutral: "bg-secondary text-secondary-foreground",
}

interface StatusBadgeProps extends React.ComponentProps<"span"> {
  tone?: StatusTone
  /** Adds a leading colored dot. */
  dot?: boolean
}

/** Pill for statuses / outcomes. Pick `tone` from a Record<Enum, StatusTone> kept next to the caller. */
function StatusBadge({ tone = "neutral", dot = false, className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

export { StatusBadge }
