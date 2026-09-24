import * as React from "react"

import { BarList } from "@/components/ui/bar-list"
import { LegendItem, LegendTones } from "@/components/ui/legend-item"
import { SectionCard } from "@/components/ui/section-card"
import { formatNumber } from "@/lib/format"

interface OutcomeBreakdownItem {
  key: string | null
  label: string | null
  is_successful: boolean
  count: number
}

interface OutcomeBreakdownCardProps {
  title: string
  /** Right-hand context in the header, e.g. "128 calls today". */
  summary?: React.ReactNode
  outcomes: OutcomeBreakdownItem[]
  emptyMessage: string
  className?: string
}

/** Ranked bars of call outcomes: ink for outcomes the agent counts as a success, gray for the rest. */
function OutcomeBreakdownCard({ title, summary, outcomes, emptyMessage, className }: OutcomeBreakdownCardProps) {
  const successCount = outcomes.filter((o) => o.is_successful).reduce((sum, o) => sum + o.count, 0)
  const otherCount = outcomes.reduce((sum, o) => sum + o.count, 0) - successCount

  return (
    <SectionCard
      title={title}
      className={className}
      actions={summary ? <span className="text-sm text-muted-foreground">{summary}</span> : undefined}
    >
      {outcomes.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <BarList
            formatValue={formatNumber}
            items={outcomes.map((outcome) => ({
              id: outcome.key ?? "none",
              label: outcome.label ?? "Not analysed yet",
              value: outcome.count,
              emphasis: outcome.is_successful,
            }))}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <LegendItem tone={LegendTones.INK}>Success outcome ({formatNumber(successCount)})</LegendItem>
            <LegendItem tone={LegendTones.MUTED}>Other outcome ({formatNumber(otherCount)})</LegendItem>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

export { OutcomeBreakdownCard }
