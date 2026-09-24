"use client";

import type { FC } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BotIcon, ChevronRightIcon, InfoIcon, PencilIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { Permissions } from "@/config/constants/permissions";
import {
  useDeleteKnowledge,
  useGetKnowledgeSource,
  useRefreshKnowledge,
  useRestoreKnowledgeVersion,
  useUpdateKnowledge,
} from "@/features/knowledge/hooks/use-knowledge";
import {
  KnowledgeSourceTypes,
  KnowledgeStatuses,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { KnowledgeStatusBadge } from "../components/knowledge-status-badge";
import { SectionCard } from "../components/section-card";
import { SourceTypeIcon } from "../components/source-type-icon";
import { EditContentDialog } from "./components/edit-content-dialog";
import { ManageAgentsDialog } from "./components/manage-agents-dialog";
import { VersionHistoryCard } from "./components/version-history-card";
import { ViewVersionDialog } from "./components/view-version-dialog";

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

interface KnowledgeDetailPageProps {
  id: string;
}

const KnowledgeDetailPage: FC<KnowledgeDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const { can } = usePermissions();
  const canWrite = can(Permissions.KNOWLEDGE_WRITE);

  const source = useGetKnowledgeSource(id);
  const update = useUpdateKnowledge();
  const refresh = useRefreshKnowledge();
  const restore = useRestoreKnowledgeVersion();
  const remove = useDeleteKnowledge();

  const [editOpen, setEditOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewVersion, setViewVersion] = useState<number | null>(null);
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);

  const backLink = (
    <Link
      href={Routes.knowledge.root}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden="true" />
      Knowledge
    </Link>
  );

  // After a delete the source no longer exists; keep the skeleton up until the redirect lands instead of flashing an error.
  if (source.isPending || remove.isSuccess) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        {backLink}
        <DetailSkeleton cards={2} />
      </div>
    );
  }

  if (source.isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        {backLink}
        <ErrorState
          title="Could not load this knowledge source"
          message={source.error.message}
          onRetry={() => source.refetch()}
        />
      </div>
    );
  }

  const data = source.data;
  const isEditable = data.type === KnowledgeSourceTypes.TEXT || data.type === KnowledgeSourceTypes.FILE;
  const isProcessing = data.status === KnowledgeStatuses.PROCESSING;
  const isFailed = data.status === KnowledgeStatuses.FAILED;
  const currentVersion = data.versions.find((version) => version.is_current);
  const agentCount = data.used_by.length;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="flex flex-col gap-3">
        {backLink}
        <PageHeader
          title={data.name}
          leading={<SourceTypeIcon type={data.type} className="mt-1 size-12 rounded-xl" />}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <KnowledgeStatusBadge status={data.status} />
              <Badge variant="outline">{getDropdownOptionLabel(KnowledgeSourceTypeOptions, data.type)}</Badge>
              <Badge variant="outline">Version {data.current_version}</Badge>
              {data.last_refreshed_at ? (
                <span>Refreshed for the AI {formatDateTime(data.last_refreshed_at)}</span>
              ) : null}
            </span>
          }
          actions={
            <>
              <label className="mr-2 flex items-center gap-2 text-sm font-medium">
                <Switch
                  checked={data.is_enabled}
                  disabled={!canWrite || update.isPending}
                  onCheckedChange={(checked) => update.mutate({ id, dto: { is_enabled: checked } })}
                />
                Agents can use this
              </label>
              {canWrite ? (
                <>
                  <ActionButtonWithPending
                    variant="outline"
                    isPending={refresh.isPending}
                    disabled={isProcessing}
                    onClick={() => refresh.mutate(id)}
                  >
                    <RefreshCwIcon aria-hidden="true" />
                    Refresh for the AI
                  </ActionButtonWithPending>
                  {isEditable ? (
                    <Button onClick={() => setEditOpen(true)}>
                      <PencilIcon aria-hidden="true" />
                      Edit content
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Delete source"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </>
              ) : null}
            </>
          }
        />
      </div>

      {isProcessing ? (
        <div className="flex gap-2.5 rounded-lg bg-muted p-3 text-sm" role="status">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p>
            <strong className="font-medium">Processing.</strong> Agents can use this as soon as it is ready. This
            page updates on its own.
          </p>
        </div>
      ) : null}

      {isFailed ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"
          role="alert"
        >
          <p>
            <strong className="font-medium text-destructive">Processing failed.</strong>{" "}
            {data.last_error ?? "The content could not be processed."}
          </p>
          {canWrite ? (
            <ActionButtonWithPending
              variant="outline"
              size="sm"
              isPending={refresh.isPending}
              onClick={() => refresh.mutate(id)}
            >
              Retry
            </ActionButtonWithPending>
          ) : null}
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard
            title="Current content"
            description={`Version ${data.current_version} · what agents can look up right now`}
            headerAction={
              data.content ? <CopyButton variant="outline" size="sm" value={data.content} label="Copy text" /> : null
            }
          >
            {data.content ? (
              <div className="max-h-[460px] overflow-auto rounded-xl border border-border bg-canvas-soft p-5 font-mono text-[13.5px] leading-7 whitespace-pre-wrap">
                {data.content}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">This source has no content yet.</p>
            )}
          </SectionCard>

          <VersionHistoryCard
            versions={data.versions}
            canRestore={canWrite && isEditable}
            onView={setViewVersion}
            onRestore={setRestoreVersion}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard title="Details">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Type</dt>
              <dd>{getDropdownOptionLabel(KnowledgeSourceTypeOptions, data.type)}</dd>
              <dt className="text-muted-foreground">Added by</dt>
              <dd>{data.added_by?.name ?? "—"}</dd>
              <dt className="text-muted-foreground">Added</dt>
              <dd>{formatDateTime(data.created_at)}</dd>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{formatDateTime(data.updated_at)}</dd>
              <dt className="text-muted-foreground">Refreshed for the AI</dt>
              <dd>{formatDateTime(data.last_refreshed_at)}</dd>
              <dt className="text-muted-foreground">Current version</dt>
              <dd>{data.current_version}</dd>
              {currentVersion ? (
                <>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>
                    {formatNumber(countWords(data.content ?? ""))} words ·{" "}
                    {formatNumber(currentVersion.content_length)} characters
                  </dd>
                </>
              ) : null}
            </dl>
          </SectionCard>

          <SectionCard
            flush
            title="Used by"
            headerAction={
              canWrite ? (
                <Button variant="ghost" size="sm" onClick={() => setAgentsOpen(true)}>
                  Manage
                </Button>
              ) : null
            }
          >
            {agentCount ? (
              <ul className="divide-y divide-border">
                {data.used_by.map((agent) => (
                  <li key={agent.id}>
                    <Link
                      href={Routes.agents.detail(agent.id)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 md:px-6"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-mint/50"
                      >
                        <BotIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{agent.name}</span>
                      <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-muted-foreground md:px-6">No agent uses this source yet.</p>
            )}
          </SectionCard>
        </div>
      </div>

      <ViewVersionDialog
        sourceId={id}
        version={viewVersion}
        currentContent={data.content}
        canRestore={canWrite && isEditable}
        onClose={() => setViewVersion(null)}
        onRestore={(version) => {
          setViewVersion(null);
          setRestoreVersion(version);
        }}
      />

      <EditContentDialog source={data} open={editOpen} onOpenChange={setEditOpen} />
      <ManageAgentsDialog source={data} open={agentsOpen} onOpenChange={setAgentsOpen} />

      <ConfirmationDialog
        open={restoreVersion !== null}
        onOpenChange={(open) => !open && setRestoreVersion(null)}
        variant="default"
        title="Restore this version?"
        description={`Version ${restoreVersion} becomes the new version ${data.current_version + 1} and agents start using it once it is refreshed. Nothing is deleted.`}
        confirmLabel="Restore"
        isPending={restore.isPending}
        onConfirm={() => restore.mutateAsync({ id, version: restoreVersion as number })}
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${data.name}?`}
        description={
          agentCount
            ? `${agentCount} ${agentCount === 1 ? "agent uses" : "agents use"} this source. They will stop using it right away. Past calls keep a record of what they knew. To pause it instead, turn it off.`
            : "Past calls keep a record of what agents knew. To pause it instead, turn it off."
        }
        confirmLabel="Delete source"
        isPending={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync(id);
          router.push(Routes.knowledge.root);
        }}
      />
    </div>
  );
};

export default KnowledgeDetailPage;
