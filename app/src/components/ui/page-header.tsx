import * as React from "react"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  /** Right-aligned actions (buttons, menus). */
  actions?: React.ReactNode
  /** Small element rendered before the title (avatar, back link, orb). */
  leading?: React.ReactNode
  className?: string
}

/** In-page heading block: editorial display title, optional description and actions. */
function PageHeader({ title, description, actions, leading, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export { PageHeader }
