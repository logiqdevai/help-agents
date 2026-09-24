"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, InfoIcon, PlugIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetIntegrationProviders } from "@/features/integrations/hooks/use-integrations";
import {
  IntegrationCategories,
  IntegrationProviders,
  type Integration,
  type IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { getManualAuthTypes } from "@/features/integrations/utils/integration-payload.utils";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { ConnectionForm } from "./components/connection-form";
import { ConnectionResult } from "./components/connection-result";
import { OAuthConnectPanel } from "./components/oauth-connect-panel";
import { ProviderPicker } from "./components/provider-picker";

const NextSteps: { title: string; text: string }[] = [
  { title: "Define the tools.", text: "Choose which actions this CRM offers (look up, update, add a note…)." },
  { title: "Match the fields.", text: "Tell us which of your CRM fields correspond to ours." },
  { title: "Allow it per agent.", text: "Each agent only gets the tools you tick." },
];

const NewIntegrationPage: FC = () => {
  const { can } = usePermissions();
  const canManage = can(Permissions.INTEGRATIONS_MANAGE);
  const requestedProvider = useSearchParams().get("provider");

  const providers = useGetIntegrationProviders();
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);
  const [useToken, setUseToken] = useState(false);
  const [created, setCreated] = useState<Integration | null>(null);

  const crmProviders = providers.data?.filter(
    (provider) => provider.category === IntegrationCategories.CRM && !provider.coming_soon,
  );
  const fallback = crmProviders?.find((p) => p.provider === IntegrationProviders.CUSTOM_CRM) ?? crmProviders?.[0];
  const provider =
    crmProviders?.find((p) => p.provider === (selected ?? requestedProvider)) ?? fallback;

  const choose = (next: IntegrationProvider) => {
    setSelected(next);
    setUseToken(false);
    setCreated(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={Routes.integrations.root}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Integrations
        </Link>
        <PageHeader
          title="Connect a CRM"
          description="Your customer data stays in your CRM. We only keep a light record of who to call and how to find them again."
        />
      </div>

      {providers.isPending ? (
        <Skeleton className="h-64 rounded-xl" aria-busy="true" />
      ) : providers.isError || !provider || !crmProviders ? (
        <ErrorState
          title="Could not load the available CRMs"
          message={providers.error?.message}
          onRetry={() => void providers.refetch()}
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Choose your CRM</CardTitle>
                <CardDescription>Pick a supported CRM, or connect your own system.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderPicker providers={crmProviders} value={provider.provider} onChange={choose} />
              </CardContent>
            </Card>

            {created ? (
              <ConnectionResult integration={created} />
            ) : provider.oauth_available && !useToken ? (
              <OAuthConnectPanel
                provider={provider}
                canManage={canManage}
                onUseToken={getManualAuthTypes(provider).length ? () => setUseToken(true) : undefined}
              />
            ) : getManualAuthTypes(provider).length ? (
              <ConnectionForm key={provider.provider} provider={provider} canManage={canManage} onCreated={setCreated} />
            ) : (
              <EmptyState
                icon={PlugIcon}
                title={`${getIntegrationProviderLabel(provider.provider)} is not available yet`}
                description="Sign-in for this CRM has not been set up on this platform yet. Choose another CRM or contact support."
              />
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-14 size-56 rounded-full bg-gradient-mint opacity-50 blur-3xl"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-10 size-52 rounded-full bg-gradient-lavender opacity-50 blur-3xl"
              />
              <div className="relative">
                <div className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  What happens next
                </div>
                <ol className="mt-4 flex flex-col gap-3 text-sm">
                  {NextSteps.map((step, index) => (
                    <li key={step.title} className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-body">
                        <b className="font-medium text-foreground">{step.title}</b> {step.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <b className="font-medium text-foreground">Not sure which method?</b>
                <p className="mt-1 text-muted-foreground">
                  Most in-house systems use an API key or a bearer token. Check your CRM API documentation, or ask
                  whoever manages it.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default NewIntegrationPage;
