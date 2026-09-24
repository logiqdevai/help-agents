import type { FC } from "react";
import { Loader2Icon } from "lucide-react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { KnowledgeStatusFilterOptions } from "@/config/constants/dropdowns/knowledge/knowledge-status-filter.options";
import {
  KnowledgeStatuses,
  type KnowledgeStatus,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const statusTone: Record<KnowledgeStatus, StatusTone> = {
  [KnowledgeStatuses.READY]: StatusTones.SUCCESS,
  [KnowledgeStatuses.PROCESSING]: StatusTones.INFO,
  [KnowledgeStatuses.FAILED]: StatusTones.DANGER,
};

interface KnowledgeStatusBadgeProps {
  status: KnowledgeStatus;
  className?: string;
}

export const KnowledgeStatusBadge: FC<KnowledgeStatusBadgeProps> = ({ status, className }) => (
  <StatusBadge tone={statusTone[status]} dot={status !== KnowledgeStatuses.PROCESSING} className={className}>
    {status === KnowledgeStatuses.PROCESSING ? (
      <Loader2Icon className="size-3 animate-spin" aria-hidden="true" />
    ) : null}
    {getDropdownOptionLabel(KnowledgeStatusFilterOptions, status)}
  </StatusBadge>
);
