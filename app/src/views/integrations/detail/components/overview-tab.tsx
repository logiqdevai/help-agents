"use client";

import type { FC, ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntegrationAuthTypeLabel } from "@/config/constants/dropdowns/integrations/integration-auth-type-form.options";
import { getIntegrationCategoryLabel } from "@/config/constants/dropdowns/integrations/integration-category-form.options";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { IntegrationStatusOptions } from "@/config/constants/dropdowns/integrations/integration-status.options";
import { useGetIntegrationAgents } from "@/features/integrations/hooks/use-integrations";
import {
  IntegrationCategories,
  IntegrationStatuses,
  type Integration,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDate, formatDateTime } from "@/lib/format";
import { Routes } from "@/routes/routes";

interface OverviewTabProps {
  integration: Integration;
  canManage: boolean;
  onEdit: () => void;
  onDisconnect: () => void;
}

const DetailRow: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="m-0 min-w-0 break-words text-foreground">{children}</dd>
  </>
);

export const OverviewTab: FC<OverviewTabProps> = ({ integration, canManage, onEdit, onDisconnect }) => {
  const isCrm = integration.category === IntegrationCategories.CRM;
  const agents = useGetIntegrationAgents(integration.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Connection details</CardTitle>
            {canManage ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-[minmax(110px,160px)_1fr]">
              <DetailRow label="Name">{integration.name}</DetailRow>
              <DetailRow label="Category">{getIntegrationCategoryLabel(integration.category)}</DetailRow>
              <DetailRow label="App">{getIntegrationProviderLabel(integration.provider)}</DetailRow>
              {integration.base_url ? (
                <DetailRow label="Base URL">
                  <span className="font-mono text-[13px]">{integration.base_url}</span>
                </DetailRow>
              ) : null}
              {integration.auth_type ? (
                <DetailRow label="Authentication">{getIntegrationAuthTypeLabel(integration.auth_type)}</DetailRow>
              ) : null}
              {integration.api_docs_url ? (
                <DetailRow label="API documentation">
                  <a
                    href={integration.api_docs_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    {integration.api_docs_url.replace(/^https?:\/\//, "")}
                    <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  </a>
                </DetailRow>
              ) : null}
              {integration.has_credentials ? (
                <DetailRow label="Saved secret">
                  {integration.credentials_hint ? (
                    <span className="font-mono tracking-wider">{integration.credentials_hint}</span>
                  ) : null}{" "}
                  <span className="text-muted-foreground">· stored encrypted, never shown again</span>
                </DetailRow>
              ) : null}
              {integration.token_expires_at ? (
                <DetailRow label="Access renews">{formatDateTime(integration.token_expires_at)}</DetailRow>
              ) : null}
              <DetailRow label="Last verified">
                {integration.last_verified_at ? formatDateTime(integration.last_verified_at) : "Never"}
                {integration.status === IntegrationStatuses.ERROR ? " · failed" : ""}
              </DetailRow>
              <DetailRow label="Status">{getDropdownOptionLabel(IntegrationStatusOptions, integration.status)}</DetailRow>
              <DetailRow label="Connected on">{formatDate(integration.created_at)}</DetailRow>
            </dl>
          </CardContent>
        </Card>

        {isCrm ? (
          <div className="flex flex-col gap-6">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-base">Used by</CardTitle>
              </CardHeader>
              {agents.isPending ? (
                <div className="flex flex-col gap-2 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : agents.isError ? (
                <p role="alert" className="p-4 text-sm text-destructive">
                  {agents.error.message}
                </p>
              ) : agents.data.length ? (
                <ul>
                  {agents.data.map((agent) => (
                    <li key={agent.id} className="border-b border-border/60 last:border-b-0">
                      <Link
                        href={Routes.agents.detail(agent.id)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <b className="block truncate font-medium text-foreground">{agent.name}</b>
                          <span className="text-[13px] text-muted-foreground">
                            {agent.allowed_tools.length}{" "}
                            {agent.allowed_tools.length === 1 ? "tool" : "tools"} allowed
                          </span>
                        </div>
                        <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  No agent uses this connection yet. Choose it in an agent&apos;s CRM settings.
                </p>
              )}
            </Card>
            {integration.status === IntegrationStatuses.ERROR && agents.data?.length ? (
              <Card>
                <CardContent className="text-sm">
                  <b className="font-medium text-foreground">Everything else keeps working.</b>
                  <p className="mt-1 text-muted-foreground">
                    Only agents using this connection are affected. Agents on other CRMs carry on as normal.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>

      {canManage ? (
        <Card className="border border-destructive/30">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Disconnect</CardTitle>
              <CardDescription className="mt-1 max-w-2xl">
                Removes this connection and its saved credentials.
                {isCrm ? " Agents using it will no longer be able to look up or update records." : ""}
              </CardDescription>
            </div>
            <Button variant="destructive" onClick={onDisconnect}>
              Disconnect {integration.name}
            </Button>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
};
