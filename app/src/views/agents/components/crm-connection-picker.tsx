"use client";

import type { FC, ReactNode } from "react";
import Link from "next/link";
import { BanIcon, PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { useGetIntegrations } from "@/features/integrations/hooks/use-integrations";
import { IntegrationCategories, IntegrationStatuses } from "@/features/integrations/interfaces/integrations.interfaces";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { IntegrationLogo } from "@/views/integrations/components/integration-logo";
import { IntegrationStatusBadge } from "@/views/integrations/components/integration-status-badge";

const CONNECTION_LIMIT = 100;

interface ChoiceRowProps {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  leading: ReactNode;
  title: string;
  description: string;
  trailing?: ReactNode;
}

const ChoiceRow: FC<ChoiceRowProps> = ({ selected, disabled, onSelect, leading, title, description, trailing }) => (
  <label
    className={cn(
      "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      selected ? "border-foreground" : "border-border hover:border-hairline-strong",
    )}
  >
    <input
      type="radio"
      name="agent-crm-connection"
      checked={selected}
      disabled={disabled}
      onChange={onSelect}
      className="sr-only"
    />
    {leading}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{title}</span>
      <span className="block text-sm text-muted-foreground">{description}</span>
    </span>
    {trailing}
    <span
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 rounded-full border",
        selected ? "border-primary bg-primary ring-2 ring-background ring-inset" : "border-input",
      )}
    />
  </label>
);

interface CrmConnectionPickerProps {
  /** Id of the chosen CRM connection, or null for no CRM. */
  value: string | null;
  onChange: (integrationId: string | null) => void;
  disabled?: boolean;
}

/** Radio list of the company's CRM connections plus "no CRM for this agent". */
export const CrmConnectionPicker: FC<CrmConnectionPickerProps> = ({ value, onChange, disabled }) => {
  const connections = useGetIntegrations({ category: IntegrationCategories.CRM, limit: CONNECTION_LIMIT });

  if (connections.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (connections.isError) {
    return (
      <ErrorState
        title="Could not load your CRM connections"
        message={connections.error.message}
        onRetry={() => connections.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="CRM connection">
      {connections.data.data.map((connection) => (
        <ChoiceRow
          key={connection.id}
          selected={value === connection.id}
          disabled={disabled}
          onSelect={() => onChange(connection.id)}
          leading={<IntegrationLogo provider={connection.provider} name={connection.name} />}
          title={connection.name}
          description={
            connection.status === IntegrationStatuses.ERROR
              ? (connection.last_error ?? "The connection is failing. Fix it before relying on it.")
              : `${getIntegrationProviderLabel(connection.provider)} · ${
                  connection.last_verified_at
                    ? `last verified ${formatRelative(connection.last_verified_at)}`
                    : "not verified yet"
                }`
          }
          trailing={<IntegrationStatusBadge status={connection.status} />}
        />
      ))}
      <ChoiceRow
        selected={value === null}
        disabled={disabled}
        onSelect={() => onChange(null)}
        leading={
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary"
          >
            <BanIcon className="size-[18px]" />
          </span>
        }
        title="No CRM for this agent"
        description="The agent won't read or write customer records."
      />
      {connections.data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">You have not connected a CRM yet.</p>
      ) : null}
      <Link
        href={Routes.integrations.create}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
      >
        <PlusIcon aria-hidden="true" />
        Connect a new CRM
      </Link>
    </div>
  );
};
