import type { FC, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned control in the header (button, badge). */
  headerAction?: ReactNode;
  /** Muted footer row under the content. */
  footer?: ReactNode;
  /** Render children edge to edge (lists) instead of inside padded content. */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Card with a hairline-separated header, used for the sections of the knowledge screens. */
export const SectionCard: FC<SectionCardProps> = ({
  title,
  description,
  headerAction,
  footer,
  flush = false,
  className,
  children,
}) => (
  <Card className={cn("gap-0 py-0", className)}>
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-5 py-4 md:px-6">
      <div className="min-w-0">
        <h3 className="font-heading text-base font-medium">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {headerAction}
    </div>
    {children ? <div className={cn(!flush && "px-5 py-5 md:px-6")}>{children}</div> : null}
    {footer ? (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/50 px-5 py-3 text-sm text-muted-foreground md:px-6">
        {footer}
      </div>
    ) : null}
  </Card>
);
