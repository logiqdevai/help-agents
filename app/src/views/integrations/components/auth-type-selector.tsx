import type { FC } from "react";
import { IntegrationAuthTypeFormOptions } from "@/config/constants/dropdowns/integrations/integration-auth-type-form.options";
import type { IntegrationAuthType } from "@/features/integrations/interfaces/integrations.interfaces";
import { cn } from "@/lib/utils";

interface AuthTypeSelectorProps {
  value: IntegrationAuthType;
  allowed: IntegrationAuthType[];
  onChange: (authType: IntegrationAuthType) => void;
}

/** Segmented radio group for "How does it authenticate?". */
export const AuthTypeSelector: FC<AuthTypeSelectorProps> = ({ value, allowed, onChange }) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-2 text-sm font-medium">How does it authenticate?</legend>
    <div className="flex flex-wrap overflow-hidden rounded-2xl border border-hairline-strong bg-background">
      {IntegrationAuthTypeFormOptions.filter((option) => allowed.includes(option.id)).map((option) => (
        <label
          key={option.id}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
            value === option.id ? "bg-primary text-primary-foreground" : "text-body hover:bg-muted",
          )}
        >
          <input
            type="radio"
            name="auth_type"
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  </fieldset>
);
