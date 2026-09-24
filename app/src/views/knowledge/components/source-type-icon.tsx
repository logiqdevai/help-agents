import type { FC } from "react";
import { CloudIcon, FileTextIcon, TypeIcon, type LucideIcon } from "lucide-react";
import {
  KnowledgeSourceTypes,
  type KnowledgeSourceType,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { cn } from "@/lib/utils";

const typeIcon: Record<KnowledgeSourceType, LucideIcon> = {
  [KnowledgeSourceTypes.TEXT]: TypeIcon,
  [KnowledgeSourceTypes.FILE]: FileTextIcon,
  [KnowledgeSourceTypes.GOOGLE_DOCS]: CloudIcon,
  [KnowledgeSourceTypes.NOTION]: CloudIcon,
  [KnowledgeSourceTypes.GOOGLE_DRIVE]: CloudIcon,
  [KnowledgeSourceTypes.DROPBOX]: CloudIcon,
  [KnowledgeSourceTypes.SHAREPOINT]: CloudIcon,
};

interface SourceTypeIconProps {
  type: KnowledgeSourceType;
  className?: string;
}

/** Soft rounded tile with the icon for how a source was added (typed, uploaded, connected). */
export const SourceTypeIcon: FC<SourceTypeIconProps> = ({ type, className }) => {
  const Icon = typeIcon[type];
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-secondary", className)}
    >
      <Icon className="size-4" />
    </span>
  );
};
