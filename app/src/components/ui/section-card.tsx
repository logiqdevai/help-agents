import * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Right side of the header: legend, toggle, link. */
  actions?: React.ReactNode
  /** Small print under the content, separated by a hairline. */
  footer?: React.ReactNode
  /** Drop the body padding so lists and tables can run edge to edge. */
  flush?: boolean
  className?: string
  contentClassName?: string
  children: React.ReactNode
}

/** Bordered card with a hairline-separated header, used for dashboard and report panels. */
function SectionCard({
  title,
  description,
  actions,
  footer,
  flush = false,
  className,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h3 className="text-base font-medium">{title}</h3>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      <div className={cn(!flush && "px-6 py-5", contentClassName)}>{children}</div>
      {footer ? <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">{footer}</div> : null}
    </Card>
  )
}

export { SectionCard }
