import * as React from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  /** The headline figure, already formatted. */
  value: React.ReactNode
  /** Small supporting line under the figure (comparison, breakdown, link). */
  note?: React.ReactNode
  className?: string
}

/** Headline metric tile: muted label, editorial display figure, optional note. */
function StatCard({ label, value, note, className }: StatCardProps) {
  return (
    <Card className={cn("gap-0 px-6 py-5", className)}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl leading-none font-light tracking-tight tabular-nums">{value}</div>
      {note ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">{note}</div>
      ) : null}
    </Card>
  )
}

function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0 px-6 py-5", className)} aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-28" />
      <Skeleton className="mt-3 h-3.5 w-36" />
    </Card>
  )
}

export { StatCard, StatCardSkeleton }
