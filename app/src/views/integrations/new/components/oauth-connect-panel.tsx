import type { FC } from "react";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { useStartIntegrationOAuth } from "@/features/integrations/hooks/use-integrations";
import type { ProviderInfo } from "@/features/integrations/interfaces/integrations.interfaces";

const Capabilities = [
  "Read contacts, leads and companies so agents can personalise calls",
  "Update records and add notes after each call",
  "Create tasks and log activities",
];

interface OAuthConnectPanelProps {
  provider: ProviderInfo;
  canManage: boolean;
  /** Offered when the provider also accepts a key or token. */
  onUseToken?: () => void;
}

export const OAuthConnectPanel: FC<OAuthConnectPanelProps> = ({ provider, canManage, onUseToken }) => {
  const startOAuth = useStartIntegrationOAuth();
  const label = getIntegrationProviderLabel(provider.provider);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">2. Sign in to {label}</CardTitle>
        <CardDescription>You will be sent to {label} to approve access, then brought right back.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted p-5 sm:p-6">
          <div className="font-medium">This connection will be able to:</div>
          <ul className="flex flex-col gap-2 text-sm">
            {Capabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-semantic-success" aria-hidden="true" />
                {capability}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Agents can only use the specific actions you allow for each agent. You can disconnect at any time.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <ActionButtonWithPending
              size="lg"
              className="h-10 px-5"
              disabled={!canManage}
              isPending={startOAuth.isPending}
              onClick={() =>
                startOAuth.mutate({ provider: provider.provider, dto: { name: provider.display_name } })
              }
            >
              <ExternalLinkIcon />
              Connect with {label}
            </ActionButtonWithPending>
            {onUseToken ? (
              <Button type="button" variant="ghost" onClick={onUseToken}>
                Use an API key or token instead
              </Button>
            ) : null}
          </div>
          {!canManage ? (
            <p className="text-sm text-muted-foreground">Ask an admin to connect integrations.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
