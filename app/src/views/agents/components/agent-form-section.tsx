import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AgentFormSectionProps {
  title: string;
  /** Short note next to the title, e.g. "Plain language". */
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** A titled block inside a setup step; consecutive sections are separated by a hairline. */
export const AgentFormSection: FC<AgentFormSectionProps> = ({ title, hint, children, className }) => (
  <section className={cn("flex flex-col gap-4 border-t border-border pt-8 first:border-t-0 first:pt-0", className)}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h3 className="text-base font-medium">{title}</h3>
      {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </div>
    {children}
  </section>
);
