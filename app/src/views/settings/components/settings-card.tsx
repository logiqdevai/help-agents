import type { FC, ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned control in the header (button, badge). */
  headerAction?: ReactNode;
  /** Footer row: hint text on the left, save button on the right. */
  footer?: ReactNode;
  /** Render children edge to edge (lists, tables) instead of inside padded content. */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Card with a hairline-separated header and an optional footer, used by every settings section. */
export const SettingsCard: FC<SettingsCardProps> = ({
  title,
  description,
  headerAction,
  footer,
  flush = false,
  className,
  children,
}) => (
  <Card className={cn("gap-0 py-0", className)}>
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-5 py-4 md:px-6 md:py-5">
      <div className="min-w-0">
        <h3 className="font-heading text-base font-medium">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {headerAction}
    </div>
    {children ? (flush ? children : <CardContent className="px-5 py-5 md:px-6">{children}</CardContent>) : null}
    {footer ? (
      <CardFooter className="flex-wrap justify-between gap-3 px-5 py-4 md:px-6">{footer}</CardFooter>
    ) : null}
  </Card>
);
