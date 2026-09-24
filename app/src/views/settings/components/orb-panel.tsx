import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OrbPanelProps {
  /** Two gradient orbs, purely decorative. */
  orbs?: [OrbColor, OrbColor];
  className?: string;
  children: ReactNode;
}

type OrbColor = "mint" | "peach" | "lavender" | "sky" | "rose";

const orbGradient: Record<OrbColor, string> = {
  mint: "bg-[radial-gradient(circle,var(--color-gradient-mint),transparent_68%)]",
  peach: "bg-[radial-gradient(circle,var(--color-gradient-peach),transparent_68%)]",
  lavender: "bg-[radial-gradient(circle,var(--color-gradient-lavender),transparent_68%)]",
  sky: "bg-[radial-gradient(circle,var(--color-gradient-sky),transparent_68%)]",
  rose: "bg-[radial-gradient(circle,var(--color-gradient-rose),transparent_68%)]",
};

/** Soft canvas panel with two blurred pastel orbs behind the content. */
export const OrbPanel: FC<OrbPanelProps> = ({ orbs = ["mint", "sky"], className, children }) => (
  <div
    className={cn(
      "relative isolate overflow-hidden rounded-3xl border border-border bg-muted p-6",
      className,
    )}
  >
    <span
      aria-hidden
      className={cn("absolute -top-16 -right-16 -z-10 size-56 rounded-full opacity-85 blur-[48px]", orbGradient[orbs[0]])}
    />
    <span
      aria-hidden
      className={cn("absolute -bottom-20 -left-14 -z-10 size-48 rounded-full opacity-85 blur-[48px]", orbGradient[orbs[1]])}
    />
    {children}
  </div>
);
