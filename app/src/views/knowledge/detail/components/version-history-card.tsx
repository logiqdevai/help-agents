import type { FC } from "react";
import { Button } from "@/components/ui/button";
import type {
  KnowledgeVersionSummary,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KnowledgeStatusBadge } from "../../components/knowledge-status-badge";
import { SectionCard } from "../../components/section-card";

interface VersionHistoryCardProps {
  versions: KnowledgeVersionSummary[];
  /** Restoring is only offered for sources edited inside the platform, and only to people who can write. */
  canRestore: boolean;
  onView: (version: number) => void;
  onRestore: (version: number) => void;
}

export const VersionHistoryCard: FC<VersionHistoryCardProps> = ({ versions, canRestore, onView, onRestore }) => (
  <SectionCard
    flush
    title="Version history"
    description="Editing creates a new version. Older versions are kept so you can see exactly what an agent knew at the time of a past call."
  >
    <ul>
      {versions.map((version) => (
        <li
          key={version.version}
          className="flex flex-wrap items-start gap-3.5 border-b border-border px-5 py-4 last:border-b-0 md:px-6"
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              version.is_current ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            v{version.version}
          </span>
          <div className="min-w-0 flex-1 basis-52">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">
                {version.is_current ? "Current version" : `Version ${version.version}`}
              </span>
              <KnowledgeStatusBadge status={version.status} />
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {version.created_by?.name ?? "Unknown"} · {formatDateTime(version.created_at)}
            </p>
            {version.error ? <p className="mt-0.5 text-sm text-destructive">{version.error}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(version.version)}>
              View
            </Button>
            {canRestore && !version.is_current ? (
              <Button variant="outline" size="sm" onClick={() => onRestore(version.version)}>
                Restore this version
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  </SectionCard>
);
