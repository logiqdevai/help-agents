import type { FC } from "react";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import {
  CustomProviders,
  type IntegrationProvider,
  type ProviderInfo,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { getManualAuthTypes } from "@/features/integrations/utils/integration-payload.utils";
import { cn } from "@/lib/utils";
import { IntegrationLogo } from "../../components/integration-logo";

interface ProviderPickerProps {
  providers: ProviderInfo[];
  value: IntegrationProvider;
  onChange: (provider: IntegrationProvider) => void;
}

export const ProviderPicker: FC<ProviderPickerProps> = ({ providers, value, onChange }) => (
  <fieldset>
    <legend className="sr-only">CRM provider</legend>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => {
        const selected = provider.provider === value;
        return (
          <label
            key={provider.provider}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-hairline-strong",
            )}
          >
            <input
              type="radio"
              name="provider"
              value={provider.provider}
              checked={selected}
              onChange={() => onChange(provider.provider)}
              className="sr-only"
            />
            <IntegrationLogo provider={provider.provider} />
            <span className="min-w-0 flex-1">
              <b className="block font-medium text-foreground">{getIntegrationProviderLabel(provider.provider)}</b>
              <span className="text-[13px] text-muted-foreground">
                {CustomProviders.includes(provider.provider)
                  ? "Your own system"
                  : provider.oauth_available
                    ? "Sign in to connect"
                    : getManualAuthTypes(provider).length
                      ? "Connect with a key"
                      : "Not set up yet"}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
