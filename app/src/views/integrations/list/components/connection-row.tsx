import type { FC } from "react";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getIntegrationAuthTypeLabel } from "@/config/constants/dropdowns/integrations/integration-auth-type-form.options";
import { getIntegrationCategoryLabel } from "@/config/constants/dropdowns/integrations/integration-category-form.options";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import {
  CustomProviders,
  IntegrationStatuses,
  type Integration,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { IntegrationLogo } from "../../components/integration-logo";
import { IntegrationStatusBadge } from "../../components/integration-status-badge";

interface ConnectionRowProps {
  integration: Integration;
}

export const ConnectionRow: FC<ConnectionRowProps> = ({ integration }) => {
  const kind = CustomProviders.includes(integration.provider)
    ? getIntegrationProviderLabel(integration.provider)
    : getIntegrationCategoryLabel(integration.category);
  const isError = integration.status === IntegrationStatuses.ERROR;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border/60 px-4 py-4 last:border-b-0 sm:px-6">
      <IntegrationLogo provider={integration.provider} name={integration.name} size="lg" />
      <div className="min-w-[200px] flex-1">
        <Link
          href={Routes.integrations.detail(integration.id)}
          className="block font-medium text-foreground underline-offset-4 hover:underline"
        >
          {integration.name}
        </Link>
        <span className="text-sm text-muted-foreground">
          {integration.auth_type ? `${kind} · ${getIntegrationAuthTypeLabel(integration.auth_type)}` : kind}
        </span>
        {isError && integration.last_error ? (
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-destructive">
            <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{integration.last_error}</span>
          </p>
        ) : null}
      </div>
      <IntegrationStatusBadge status={integration.status} />
      <div className="min-w-[150px] text-[13px] text-muted-foreground">
        <div>
          {integration.last_verified_at
            ? `${isError ? "Last verified" : "Verified"} ${formatRelative(integration.last_verified_at)}`
            : "Not verified yet"}
        </div>
        <div>
          Used by {integration.agent_count} {integration.agent_count === 1 ? "agent" : "agents"}
        </div>
      </div>
      <Link
        href={Routes.integrations.detail(integration.id)}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {isError ? "Fix connection" : "Manage"}
      </Link>
    </li>
  );
};
