import type { FC } from "react";
import Link from "next/link";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getIntegrationCategoryLabel } from "@/config/constants/dropdowns/integrations/integration-category-form.options";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { getIntegrationProviderDescription } from "@/config/constants/dropdowns/integrations/integration-provider-description.options";
import {
  CustomProviders,
  IntegrationCategories,
  type Integration,
  type ProviderInfo,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { IntegrationLogo } from "../../components/integration-logo";

interface ProviderCardProps {
  provider: ProviderInfo;
  /** Existing connections of this provider. */
  connections: Integration[];
  canManage: boolean;
  isConnecting: boolean;
  /** Starts the one-click sign-in for apps that are not CRMs. */
  onConnect: (provider: ProviderInfo) => void;
}

export const ProviderCard: FC<ProviderCardProps> = ({ provider, connections, canManage, isConnecting, onConnect }) => {
  const isCrm = provider.category === IntegrationCategories.CRM;
  const isCustom = CustomProviders.includes(provider.provider);
  const firstConnection = connections[0];
  // A CRM can be connected several times when it is the customer's own system.
  const canConnectAnother = canManage && !provider.coming_soon && (!firstConnection || isCustom);

  return (
    <Card className={cn("gap-3.5 p-5", provider.coming_soon && "bg-muted/60")}>
      <div className="flex items-center gap-3.5">
        <IntegrationLogo provider={provider.provider} className={cn(provider.coming_soon && "opacity-70")} />
        <div className="min-w-0">
          <b className="block font-medium text-foreground">{getIntegrationProviderLabel(provider.provider)}</b>
          <span className="text-[13px] text-muted-foreground">
            {isCustom ? "Your own system" : getIntegrationCategoryLabel(provider.category)}
          </span>
        </div>
      </div>
      <p className="flex-1 text-sm text-body">{getIntegrationProviderDescription(provider.provider)}</p>
      <div className="flex items-center justify-between gap-2">
        {provider.coming_soon ? (
          <Badge variant="outline">Coming soon</Badge>
        ) : firstConnection ? (
          <Badge variant="secondary">
            {connections.length > 1 ? `${connections.length} connected` : "Connected"}
          </Badge>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {firstConnection && connections.length === 1 ? (
            <Link
              href={Routes.integrations.detail(firstConnection.id)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Manage
            </Link>
          ) : null}
          {canConnectAnother && isCrm ? (
            <Link
              href={`${Routes.integrations.create}?provider=${provider.provider}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Connect
            </Link>
          ) : null}
          {canConnectAnother && !isCrm ? (
            <ActionButtonWithPending
              variant="outline"
              size="sm"
              isPending={isConnecting}
              onClick={() => onConnect(provider)}
            >
              Connect
            </ActionButtonWithPending>
          ) : null}
        </div>
      </div>
    </Card>
  );
};
