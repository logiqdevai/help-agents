"use client";

import { useState, type FC } from "react";
import { InfoIcon, PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  getCrmToolCategoryLabel,
  isCrmToolReadOnly,
} from "@/config/constants/dropdowns/integrations/crm-tool-category.options";
import {
  useDeleteCrmTool,
  useGetIntegrationCrmTools,
  useUpdateCrmTool,
} from "@/features/integrations/hooks/use-crm-tools";
import { CustomProviders, type CrmTool, type Integration } from "@/features/integrations/interfaces/integrations.interfaces";
import { CrmEndpointsCard } from "./crm-endpoints-card";
import { CrmToolDialog } from "./crm-tool-dialog";

interface ToolsTabProps {
  integration: Integration;
  canManage: boolean;
}

const ToolRow: FC<{
  tool: CrmTool;
  canEdit: boolean;
  isToggling: boolean;
  onToggle: (active: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ tool, canEdit, isToggling, onToggle, onEdit, onDelete }) => {
  const [showSchema, setShowSchema] = useState(false);
  const schemaId = `schema-${tool.id}`;

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-border/60 px-4 py-4 last:border-b-0 sm:px-6">
      <div className="min-w-[220px] flex-1">
        <b className="block font-medium text-foreground">{tool.name}</b>
        {tool.description ? <span className="text-sm text-muted-foreground">{tool.description} </span> : null}
        <span className="font-mono text-xs text-muted-foreground">{tool.key}</span>
        {tool.http ? (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {tool.http.method} {tool.http.path}
          </p>
        ) : null}
      </div>
      <Badge variant="secondary">{isCrmToolReadOnly(tool.category) ? "Read" : "Write"}</Badge>
      <Badge variant="outline">{getCrmToolCategoryLabel(tool.category)}</Badge>
      {tool.scope === "custom" && canEdit ? (
        <Switch
          checked={tool.is_active}
          disabled={isToggling}
          onCheckedChange={onToggle}
          aria-label={`${tool.name} available to agents`}
        />
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={showSchema}
        aria-controls={schemaId}
        onClick={() => setShowSchema((v) => !v)}
      >
        Input schema
      </Button>
      {tool.scope === "custom" && canEdit ? (
        <>
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${tool.name}`} onClick={onEdit}>
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${tool.name}`} onClick={onDelete}>
            <Trash2Icon />
          </Button>
        </>
      ) : null}
      {showSchema ? (
        <div id={schemaId} className="basis-full">
          <pre className="mt-1 overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs">
            {JSON.stringify(tool.input_schema, null, 2)}
          </pre>
        </div>
      ) : null}
    </li>
  );
};

export const ToolsTab: FC<ToolsTabProps> = ({ integration, canManage }) => {
  const tools = useGetIntegrationCrmTools(integration.id, { include_inactive: true });
  const updateTool = useUpdateCrmTool();
  const deleteTool = useDeleteCrmTool();
  const [dialogTool, setDialogTool] = useState<CrmTool | "new" | null>(null);
  const [toolToDelete, setToolToDelete] = useState<CrmTool | null>(null);
  const isCustom = CustomProviders.includes(integration.provider);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-body">
          <b className="font-medium text-foreground">Each CRM has its own list of tools.</b> These are the actions{" "}
          <b className="font-medium text-foreground">{integration.name}</b> offers
          {isCustom ? ", as defined by your team" : ""}. Agents get only the ones you tick on the agent itself.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border py-4">
          <div>
            <CardTitle className="text-base">Tools this CRM offers</CardTitle>
            <CardDescription className="mt-1">
              {isCustom ? "Defined by you for this custom connection." : "Provided for this CRM."}
            </CardDescription>
          </div>
          {isCustom && canManage ? (
            <Button variant="outline" size="sm" onClick={() => setDialogTool("new")}>
              <PlusIcon />
              Add tool
            </Button>
          ) : null}
        </CardHeader>
        {tools.isPending ? (
          <div className="flex flex-col gap-3 p-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : tools.isError ? (
          <div className="p-4">
            <ErrorState title="Could not load tools" message={tools.error.message} onRetry={() => void tools.refetch()} />
          </div>
        ) : tools.data.length ? (
          <ul>
            {tools.data.map((tool) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                canEdit={canManage}
                isToggling={updateTool.isPending && updateTool.variables?.toolId === tool.id}
                onToggle={(active) =>
                  updateTool.mutate({ integrationId: integration.id, toolId: tool.id, dto: { is_active: active } })
                }
                onEdit={() => setDialogTool(tool)}
                onDelete={() => setToolToDelete(tool)}
              />
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={WrenchIcon}
              title="No tools yet"
              description={
                isCustom
                  ? "Add the actions your system offers, such as looking up a contact or adding a note."
                  : "This CRM has no tools available."
              }
              action={
                isCustom && canManage ? (
                  <Button size="lg" onClick={() => setDialogTool("new")}>
                    <PlusIcon />
                    Add tool
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </Card>

      <p className="text-sm text-muted-foreground">
        The AI can only <b className="font-medium text-foreground">request</b> a tool. Before anything reaches your CRM,
        we check that the agent is allowed to use it, that this connection is valid, and that the request makes sense.
      </p>

      {isCustom ? <CrmEndpointsCard integration={integration} canManage={canManage} /> : null}

      <CrmToolDialog
        integrationId={integration.id}
        tool={dialogTool && dialogTool !== "new" ? dialogTool : undefined}
        open={dialogTool !== null}
        onOpenChange={(open) => !open && setDialogTool(null)}
      />
      <ConfirmationDialog
        open={toolToDelete !== null}
        onOpenChange={(open) => !open && setToolToDelete(null)}
        title={`Delete ${toolToDelete?.name ?? "tool"}?`}
        description="Agents that were allowed to use this tool will no longer be able to call it. This cannot be undone."
        confirmLabel="Delete tool"
        isPending={deleteTool.isPending}
        onConfirm={() =>
          toolToDelete ? deleteTool.mutateAsync({ integrationId: integration.id, toolId: toolToDelete.id }) : undefined
        }
      />
    </div>
  );
};
