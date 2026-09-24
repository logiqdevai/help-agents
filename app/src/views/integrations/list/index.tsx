"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { InfoIcon, PlugIcon, PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getIntegrationProviderGroup,
  IntegrationGroupFilterOptions,
  IntegrationGroupFormOptions,
  type IntegrationGroup,
} from "@/config/constants/dropdowns/integrations/integration-group-filter.options";
import { Permissions } from "@/config/constants/permissions";
import {
  useGetIntegrationProviders,
  useGetIntegrations,
  useStartIntegrationOAuth,
} from "@/features/integrations/hooks/use-integrations";
import {
  IntegrationCategories,
  IntegrationStatuses,
  type Integration,
  type ProviderInfo,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { Routes } from "@/routes/routes";
import { ConnectionRow } from "./components/connection-row";
import { ProviderCard } from "./components/provider-card";

type GroupFilter = IntegrationGroup | "all";

const IntegrationsPage: FC = () => {
  const { can } = usePermissions();
  const canManage = can(Permissions.INTEGRATIONS_MANAGE);
  const [group, setGroup] = useState<GroupFilter>("all");

  const integrations = useGetIntegrations({ limit: 100 });
  const providers = useGetIntegrationProviders();
  const startOAuth = useStartIntegrationOAuth();

  if (integrations.isPending || providers.isPending) return <IntegrationsSkeleton />;

  if (integrations.isError || providers.isError) {
    const failed = integrations.isError ? integrations : providers;
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState
          title="Could not load integrations"
          message={failed.error?.message}
          onRetry={() => {
            void integrations.refetch();
            void providers.refetch();
          }}
        />
      </div>
    );
  }

  const connections = integrations.data.data;
  const catalogue = providers.data;
  const connectionsIn = (target: GroupFilter): Integration[] =>
    connections.filter((c) => target === "all" || getIntegrationProviderGroup(c.provider) === target);
  const hasCrmConnection = connections.some((c) => c.category === IntegrationCategories.CRM);

  const connectOAuth = (provider: ProviderInfo) =>
    startOAuth.mutate({ provider: provider.provider, dto: { name: provider.display_name } });

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Integrations"
        description="Connect the CRM you already use, and over time the other tools your business runs on. Agents only get the actions you allow, per agent."
        actions={
          canManage ? (
            <Link href={Routes.integrations.create} className={buttonVariants({ size: "lg" })}>
              <PlusIcon />
              Connect a CRM
            </Link>
          ) : null
        }
      />

      <Tabs value={group} onValueChange={(value) => setGroup(value as GroupFilter)} className="gap-6">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" className="h-10 border-b border-border">
            {IntegrationGroupFilterOptions.map((option) => {
              const count = option.id === "all" ? 0 : connectionsIn(option.id).length;
              return (
                <TabsTrigger key={option.id} value={option.id} className="flex-none px-3">
                  {option.label}
                  {count > 0 ? (
                    <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">{count}</span>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {IntegrationGroupFilterOptions.map((option) => {
          const visible = connectionsIn(option.id);
          const needAttention = visible.filter((c) => c.status === IntegrationStatuses.ERROR).length;
          const shownGroups =
            option.id === "all" ? IntegrationGroupFormOptions : IntegrationGroupFormOptions.filter((g) => g.id === option.id);

          return (
            <TabsContent key={option.id} value={option.id} className="flex flex-col gap-8">
              {visible.length ? (
                <section className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl font-light tracking-tight">Connected</h3>
                    <span className="text-sm text-muted-foreground">
                      {visible.length} {visible.length === 1 ? "connection" : "connections"}
                      {needAttention ? ` · ${needAttention} ${needAttention === 1 ? "needs" : "need"} attention` : ""}
                    </span>
                  </div>
                  <Card className="gap-0 py-0">
                    <ul>
                      {visible.map((integration) => (
                        <ConnectionRow key={integration.id} integration={integration} />
                      ))}
                    </ul>
                  </Card>
                </section>
              ) : option.id === "all" ? (
                <EmptyState
                  icon={PlugIcon}
                  title="Nothing connected yet"
                  description="Connect your CRM so agents can look up people before a call and update records afterwards."
                  action={
                    canManage ? (
                      <Link href={Routes.integrations.create} className={buttonVariants({ size: "lg" })}>
                        Connect a CRM
                      </Link>
                    ) : undefined
                  }
                />
              ) : null}

              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-light tracking-tight">Available</h3>
                  <span className="text-sm text-muted-foreground">Add more over time — no rebuild needed</span>
                </div>
                {shownGroups.map((shown) => {
                  const cards = catalogue.filter((p) => getIntegrationProviderGroup(p.provider) === shown.id);
                  if (!cards.length) return null;
                  return (
                    <div key={shown.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                          {shown.label}
                        </span>
                        <hr className="flex-1 border-border" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((provider) => (
                          <ProviderCard
                            key={provider.provider}
                            provider={provider}
                            connections={connections.filter((c) => c.provider === provider.provider)}
                            canManage={canManage}
                            isConnecting={startOAuth.isPending && startOAuth.variables?.provider === provider.provider}
                            onConnect={connectOAuth}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>

              {option.id === "crm" && hasCrmConnection ? (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
                  <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="text-body">
                    Each CRM has its own list of tools. When you set up an agent, you choose <b className="font-medium text-foreground">only</b>{" "}
                    the actions from that CRM it is allowed to use.
                  </p>
                </div>
              ) : null}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

const IntegrationsSkeleton: FC = () => (
  <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6" aria-busy="true">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
    <Skeleton className="h-10 w-full max-w-md" />
    <Skeleton className="h-28 rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  </div>
);

export default IntegrationsPage;
