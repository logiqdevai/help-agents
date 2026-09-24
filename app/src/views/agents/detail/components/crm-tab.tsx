"use client";

import type { FC } from "react";
import Link from "next/link";
import { CircleCheckIcon, CircleIcon, DatabaseIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrmFieldDirectionFormOptions } from "@/config/constants/dropdowns/integrations/crm-field-direction-form.options";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { useGetAgentCrmTools } from "@/features/agents/hooks/use-agents";
import type { Agent, AgentCrmRef } from "@/features/agents/interfaces/agents.interfaces";
import { useGetFieldMappings, useGetInternalCrmFields } from "@/features/integrations/hooks/use-field-mappings";
import { GoalFieldPrefix, type InternalField } from "@/features/integrations/interfaces/integrations.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { IntegrationLogo } from "@/views/integrations/components/integration-logo";
import { IntegrationStatusBadge } from "@/views/integrations/components/integration-status-badge";

const fieldLabel = (key: string, fields: InternalField[]): string =>
  key.startsWith(GoalFieldPrefix)
    ? `Collected: ${key.slice(GoalFieldPrefix.length)}`
    : (fields.find((field) => field.key === key)?.label ?? key);

const ToolList: FC<{ title: string; tools: { id: string; name: string; description: string | null }[]; allowed: boolean }> = ({
  title,
  tools,
  allowed,
}) => {
  const Icon = allowed ? CircleCheckIcon : CircleIcon;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      {tools.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">{allowed ? "Nothing is allowed." : "Nothing else is on offer."}</p>
      ) : (
        <ul>
          {tools.map((tool) => (
            <li key={tool.id} className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
              <Icon
                className={allowed ? "mt-0.5 size-4 shrink-0 text-semantic-success" : "mt-0.5 size-4 shrink-0 text-muted-foreground"}
                aria-hidden="true"
              />
              <div className="min-w-0 text-sm">
                <p className={allowed ? "font-medium" : "text-muted-foreground"}>{tool.name}</p>
                {allowed && tool.description ? <p className="text-muted-foreground">{tool.description}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AllowedTools: FC<{ agentId: string; integrationName: string }> = ({ agentId, integrationName }) => {
  const tools = useGetAgentCrmTools(agentId);

  return (
    <SectionCard
      title={`What this agent can do in ${integrationName}`}
      description="Only what is allowed."
      footer="The AI can only request actions. The platform checks each request before anything is changed."
    >
      {tools.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : tools.isError ? (
        <ErrorState title="Could not load the CRM actions" message={tools.error.message} onRetry={() => tools.refetch()} />
      ) : (
        <div className="flex flex-col gap-5">
          <ToolList title="Allowed" tools={tools.data.data.filter((tool) => tool.allowed)} allowed />
          <ToolList title="Not allowed" tools={tools.data.data.filter((tool) => !tool.allowed)} allowed={false} />
        </div>
      )}
    </SectionCard>
  );
};

const MappingSummary: FC<{ integration: AgentCrmRef; agentId: string }> = ({ integration, agentId }) => {
  const mappings = useGetFieldMappings(integration.id, agentId);
  const internalFields = useGetInternalCrmFields();

  const rows = mappings.data ? (mappings.data.data.length ? mappings.data.data : (mappings.data.inherited ?? [])) : [];
  const personalized = rows.filter((row) => row.use_for_personalization);
  const fields = internalFields.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Field mapping" description="Set once per connection; an agent can override it." flush>
        {mappings.isPending ? (
          <Skeleton className="m-6 h-32" />
        ) : mappings.isError ? (
          <div className="p-6">
            <ErrorState
              title="Could not load the field mapping"
              message={mappings.error.message}
              onRetry={() => mappings.refetch()}
            />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No fields are matched yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Our field</TableHead>
                <TableHead>{integration.name} field</TableHead>
                <TableHead>Direction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{fieldLabel(row.internal_field, fields)}</TableCell>
                  <TableCell className="text-muted-foreground">{row.external_field}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getDropdownOptionLabel(CrmFieldDirectionFormOptions, row.direction)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="Personalization" description="Passed to the agent before dialing.">
        {personalized.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No details are handed to the agent before a call. Tick &ldquo;personalize calls&rdquo; on a mapped field
            to change that.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {personalized.map((row) => (
              <li key={row.id} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs">
                {fieldLabel(row.internal_field, fields)}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

export const CrmTab: FC<{ agent: Agent }> = ({ agent }) => {
  const integration = agent.crm_integration;

  if (!integration) {
    return (
      <EmptyState
        icon={DatabaseIcon}
        title="No CRM connected"
        description="This agent does not read or write customer records. Connect a CRM from the agent's settings."
        action={
          <Link href={Routes.agents.edit(agent.id, "crm")} className={buttonVariants({ variant: "outline" })}>
            Choose a CRM
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex-row flex-wrap items-center gap-4 px-6 py-5">
        <IntegrationLogo provider={integration.provider} name={integration.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{integration.name}</p>
          <p className="text-sm text-muted-foreground">{getIntegrationProviderLabel(integration.provider)}</p>
        </div>
        <IntegrationStatusBadge status={integration.status} />
        <Link href={Routes.integrations.detail(integration.id)} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Manage connection
        </Link>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <AllowedTools agentId={agent.id} integrationName={integration.name} />
        <MappingSummary integration={integration} agentId={agent.id} />
      </div>
    </div>
  );
};
