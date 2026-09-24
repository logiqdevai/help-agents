import * as React from "react"

import { cn } from "@/lib/utils"

export const OrbTones = {
  MINT: "mint",
  PEACH: "peach",
  LAVENDER: "lavender",
  SKY: "sky",
  ROSE: "rose",
} as const
export type OrbTone = (typeof OrbTones)[keyof typeof OrbTones]

const orbToneClasses: Record<OrbTone, string> = {
  mint: "bg-[radial-gradient(circle,var(--color-gradient-mint),transparent_68%)]",
  peach: "bg-[radial-gradient(circle,var(--color-gradient-peach),transparent_68%)]",
  lavender: "bg-[radial-gradient(circle,var(--color-gradient-lavender),transparent_68%)]",
  sky: "bg-[radial-gradient(circle,var(--color-gradient-sky),transparent_68%)]",
  rose: "bg-[radial-gradient(circle,var(--color-gradient-rose),transparent_68%)]",
}

interface OrbCardProps extends React.ComponentProps<"div"> {
  /** Decorative blooms; `className` positions and sizes each one (e.g. "size-64 -right-16 -top-16"). */
  orbs: { tone: OrbTone; className: string }[]
}

/** Card with soft pastel atmospheric orbs behind its content (DESIGN.MD gradient-orb-card). */
function OrbCard({ orbs, className, children, ...props }: OrbCardProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden rounded-2xl border border-border bg-muted p-6", className)}
      {...props}
    >
      {orbs.map((orb, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -z-10 rounded-full opacity-80 blur-3xl dark:opacity-40",
            orbToneClasses[orb.tone],
            orb.className,
          )}
        />
      ))}
      {children}
    </div>
  )
}

export { OrbCard }
