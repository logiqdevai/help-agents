"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CircleAlertIcon, KeyIcon, RefreshCwIcon, ZapIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { Permissions } from "@/config/constants/permissions";
import {
  useDeleteIntegration,
  useGetIntegration,
  useGetIntegrationProviders,
  useStartIntegrationOAuth,
  useTestIntegration,
} from "@/features/integrations/hooks/use-integrations";
import {
  CustomProviders,
  IntegrationAuthTypes,
  IntegrationCategories,
  IntegrationStatuses,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { getManualAuthTypes } from "@/features/integrations/utils/integration-payload.utils";
import { usePermissions } from "@/hooks/use-permissions";
import { formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { IntegrationLogo } from "../components/integration-logo";
import { IntegrationStatusBadge } from "../components/integration-status-badge";
import { AgentsTab } from "./components/agents-tab";
import { ContactsTab } from "./components/contacts-tab";
import { EditConnectionDialog } from "./components/edit-connection-dialog";
import { FieldMappingTab } from "./components/field-mapping-tab";
import { OverviewTab } from "./components/overview-tab";
import { ToolsTab } from "./components/tools-tab";
import { UpdateCredentialsDialog } from "./components/update-credentials-dialog";

const IntegrationDetailPage: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { can } = usePermissions();
  const canManage = can(Permissions.INTEGRATIONS_MANAGE);

  const integration = useGetIntegration(id);
  const providers = useGetIntegrationProviders();
  const testConnection = useTestIntegration();
  const deleteIntegration = useDeleteIntegration();
  const startOAuth = useStartIntegrationOAuth();

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  if (integration.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <DetailSkeleton cards={3} withTable={false} />
      </div>
    );
  }

  if (integration.isError) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState
          title="Could not load this integration"
          message={integration.error.message}
          onRetry={() => void integration.refetch()}
        />
      </div>
    );
  }

  const connection = integration.data;
  const isCrm = connection.category === IntegrationCategories.CRM;
  const isError = connection.status === IntegrationStatuses.ERROR;
  const providerInfo = providers.data?.find((p) => p.provider === connection.provider);
  const manualAuthTypes = providerInfo ? getManualAuthTypes(providerInfo) : [];
  // Sign-in providers are reconnected through their own consent screen, everything else by entering new secrets.
  const isManagedOAuth =
    connection.auth_type === IntegrationAuthTypes.OAUTH2 && !CustomProviders.includes(connection.provider);
  const canUpdateCredentials = canManage && (isManagedOAuth || manualAuthTypes.length > 0);

  const openCredentials = () => {
    if (isManagedOAuth) {
      startOAuth.mutate({ provider: connection.provider, dto: { integration_uuid: connection.id } });
    } else {
      setCredentialsOpen(true);
    }
  };
  const credentialsLabel = isManagedOAuth ? "Reconnect" : "Update credentials";

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
          title={connection.name}
          leading={<IntegrationLogo provider={connection.provider} name={connection.name} size="lg" />}
          description={
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <IntegrationStatusBadge status={connection.status} />
              <Badge variant="outline">{getIntegrationProviderLabel(connection.provider)}</Badge>
              <span>
                {connection.last_verified_at
                  ? `Last verified ${formatRelative(connection.last_verified_at)}`
                  : "Not verified yet"}
                {isCrm ? ` · used by ${connection.agent_count} ${connection.agent_count === 1 ? "agent" : "agents"}` : ""}
              </span>
            </span>
          }
          actions={
            canManage ? (
              <>
                <ActionButtonWithPending
                  variant="outline"
                  size="lg"
                  isPending={testConnection.isPending}
                  onClick={() => testConnection.mutate(connection.id)}
                >
                  <ZapIcon />
                  Test connection
                </ActionButtonWithPending>
                {canUpdateCredentials ? (
                  <ActionButtonWithPending size="lg" isPending={startOAuth.isPending} onClick={openCredentials}>
                    {isManagedOAuth ? <RefreshCwIcon /> : <KeyIcon />}
                    {credentialsLabel}
                  </ActionButtonWithPending>
                ) : null}
              </>
            ) : undefined
          }
        />
      </div>

      {isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{connection.last_error ?? "The last connection check failed."}</AlertTitle>
          <AlertDescription>
            {isCrm
              ? "Calls are still saved, but CRM updates are paused and retried once this is fixed."
              : "This connection is not working right now."}
          </AlertDescription>
          {canUpdateCredentials ? (
            <AlertAction>
              <Button variant="outline" size="sm" onClick={openCredentials}>
                {isManagedOAuth ? "Reconnect" : "Update key"}
              </Button>
            </AlertAction>
          ) : null}
        </Alert>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList variant="line" className="h-10 border-b border-border">
            <TabsTrigger value="overview" className="flex-none px-3">
              Overview
            </TabsTrigger>
            {isCrm ? (
              <>
                <TabsTrigger value="tools" className="flex-none px-3">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="mapping" className="flex-none px-3">
                  Field mapping
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex-none px-3">
                  Agents
                  {connection.agent_count > 0 ? (
                    <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">
                      {connection.agent_count}
                    </span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex-none px-3">
                  Contacts
                </TabsTrigger>
              </>
            ) : null}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab
            integration={connection}
            canManage={canManage}
            onEdit={() => setEditOpen(true)}
            onDisconnect={() => setDisconnectOpen(true)}
          />
        </TabsContent>
        {isCrm ? (
          <>
            <TabsContent value="tools">
              <ToolsTab integration={connection} canManage={canManage} />
            </TabsContent>
            <TabsContent value="mapping">
              <FieldMappingTab integrationId={connection.id} integrationName={connection.name} canManage={canManage} />
            </TabsContent>
            <TabsContent value="agents">
              <AgentsTab integrationId={connection.id} canEditAgents={can(Permissions.AGENTS_WRITE)} />
            </TabsContent>
            <TabsContent value="contacts">
              <ContactsTab
                integrationId={connection.id}
                integrationName={connection.name}
                canWrite={can(Permissions.CONTACTS_WRITE)}
              />
            </TabsContent>
          </>
        ) : null}
      </Tabs>

      <EditConnectionDialog integration={connection} open={editOpen} onOpenChange={setEditOpen} />
      {manualAuthTypes.length > 0 ? (
        <UpdateCredentialsDialog
          integration={connection}
          authTypes={manualAuthTypes}
          open={credentialsOpen}
          onOpenChange={setCredentialsOpen}
        />
      ) : null}
      <ConfirmationDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title={`Disconnect ${connection.name}?`}
        description={
          isCrm
            ? "Agents using it will stop looking up and updating records. Call history stays. You can reconnect at any time."
            : "This removes the connection and its saved credentials. You can reconnect at any time."
        }
        confirmLabel="Disconnect"
        cancelLabel="Keep connected"
        isPending={deleteIntegration.isPending}
        onConfirm={async () => {
          await deleteIntegration.mutateAsync(connection.id);
          router.replace(Routes.integrations.root);
        }}
      />
    </div>
  );
};

export default IntegrationDetailPage;
