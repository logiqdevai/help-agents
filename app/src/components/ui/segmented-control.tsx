"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: ReadonlyArray<{ id: T; label: React.ReactNode }>
  /** Accessible name of the group, e.g. "Time period". */
  "aria-label": string
  className?: string
}

/** Pill-shaped single-choice toggle for short option sets (period, chart / table view). */
function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={props["aria-label"]}
      className={cn("inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-secondary p-[3px]", className)}
    >
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.id)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl }
