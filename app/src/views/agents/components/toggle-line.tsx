"use client";

import { useId, type FC, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ToggleLineProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** A switch with a title and a line of help text, for on/off settings. */
export const ToggleLine: FC<ToggleLineProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Switch
        className="mt-0.5"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
      />
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
        {description ? (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
};
