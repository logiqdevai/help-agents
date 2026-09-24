"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetKnowledgeVersion } from "@/features/knowledge/hooks/use-knowledge";
import type { KnowledgeVersionDetail } from "@/features/knowledge/interfaces/knowledge.interfaces";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DiffKinds, diffLines } from "../../utils/line-diff.utils";

const DocumentClasses =
  "max-h-[26rem] overflow-auto rounded-xl border border-border bg-canvas-soft p-5 font-mono text-[13px] leading-7 whitespace-pre-wrap";

const ViewModes = {
  CHANGES: "changes",
  FULL: "full",
} as const;

interface VersionBodyProps {
  version: KnowledgeVersionDetail;
  currentContent: string | null;
}

const VersionBody: FC<VersionBodyProps> = ({ version, currentContent }) => {
  const diff = useMemo(
    () => (version.is_current || currentContent === null ? null : diffLines(version.content, currentContent)),
    [version, currentContent],
  );

  if (!diff) {
    return (
      <div className="flex flex-col gap-3">
        {!version.is_current && currentContent !== null ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="note">
            This version is too large to compare line by line with the current one.
          </p>
        ) : null}
        <div className={DocumentClasses}>{version.content}</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={ViewModes.CHANGES}>
      <TabsList>
        <TabsTrigger value={ViewModes.CHANGES}>Changes since</TabsTrigger>
        <TabsTrigger value={ViewModes.FULL}>Full text</TabsTrigger>
      </TabsList>
      <TabsContent value={ViewModes.CHANGES} className="flex flex-col gap-3">
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="note">
          Compared with the current version: <strong className="font-medium text-foreground">{diff.added}</strong>{" "}
          {diff.added === 1 ? "line" : "lines"} added, <strong className="font-medium text-foreground">{diff.removed}</strong>{" "}
          {diff.removed === 1 ? "line" : "lines"} removed since.
        </p>
        <div className={DocumentClasses}>
          {diff.lines.map((line, index) => (
            <span
              key={index}
              className={cn(
                "block min-h-7 rounded px-2",
                line.kind === DiffKinds.ADDED && "bg-semantic-success/10",
                line.kind === DiffKinds.REMOVED && "bg-destructive/10 line-through decoration-destructive/50",
              )}
            >
              {line.kind === DiffKinds.ADDED ? <span className="sr-only">Added in the current version: </span> : null}
              {line.kind === DiffKinds.REMOVED ? <span className="sr-only">Removed in the current version: </span> : null}
              {line.text}
            </span>
          ))}
        </div>
      </TabsContent>
      <TabsContent value={ViewModes.FULL}>
        <div className={DocumentClasses}>{version.content}</div>
      </TabsContent>
    </Tabs>
  );
};

interface ViewVersionDialogProps {
  sourceId: string;
  /** The version being viewed; null keeps the dialog closed. */
  version: number | null;
  currentContent: string | null;
  canRestore: boolean;
  onClose: () => void;
  onRestore: (version: number) => void;
}

export const ViewVersionDialog: FC<ViewVersionDialogProps> = ({
  sourceId,
  version,
  currentContent,
  canRestore,
  onClose,
  onRestore,
}) => {
  const query = useGetKnowledgeVersion(sourceId, version);
  const data = query.data;

  return (
    <Dialog open={version !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Version {version}
            {data?.is_current ? <StatusBadge tone={StatusTones.SUCCESS}>Current</StatusBadge> : null}
          </DialogTitle>
          <DialogDescription>
            {data ? `${data.created_by?.name ?? "Unknown"} · ${formatDateTime(data.created_at)} · read-only` : "Read-only"}
          </DialogDescription>
        </DialogHeader>

        {query.isPending ? <Skeleton className="h-72 w-full rounded-xl" /> : null}
        {query.isError ? (
          <ErrorState title="Could not load this version" message={query.error.message} onRetry={() => query.refetch()} />
        ) : null}
        {data ? <VersionBody version={data} currentContent={currentContent} /> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          {canRestore && data && !data.is_current ? (
            <Button onClick={() => onRestore(data.version)}>Restore this version</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
