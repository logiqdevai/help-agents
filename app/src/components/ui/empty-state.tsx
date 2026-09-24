import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** Call to action, e.g. a Link styled as a button. */
  action?: React.ReactNode
}

/** Standard "nothing here yet" block for lists and panels. */
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Empty className="rounded-xl border border-dashed border-border bg-card/50 py-12">
      <EmptyHeader>
        {Icon ? (
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}

export { EmptyState }
