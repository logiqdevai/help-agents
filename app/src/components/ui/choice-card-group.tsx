"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChoiceCardOption<T extends string> {
  id: T
  label: string
  description: string
  icon: LucideIcon
}

interface ChoiceCardGroupProps<T extends string> {
  name: string
  "aria-label": string
  value: T
  options: ChoiceCardOption<T>[]
  onValueChange: (value: T) => void
  className?: string
}

/** Large selectable cards (radio semantics) for "how do you want to do this?" choices. */
function ChoiceCardGroup<T extends string>({
  name,
  value,
  options,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: ChoiceCardGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {options.map(({ id, label, description, icon: Icon }) => {
        const selected = id === value
        return (
          <label
            key={id}
            className={cn(
              "relative flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              selected ? "border-foreground" : "border-border hover:border-hairline-strong",
            )}
          >
            <input
              type="radio"
              name={name}
              value={id}
              checked={selected}
              onChange={() => onValueChange(id)}
              className="sr-only"
            />
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
              )}
            >
              {selected ? <CheckIcon className="size-3" /> : null}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export { ChoiceCardGroup }
