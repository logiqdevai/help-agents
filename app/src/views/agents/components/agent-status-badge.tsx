import type { FC } from "react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { AgentStatusFormOptions } from "@/config/constants/dropdowns/analytics/agent-status-form.options";
import { AgentStatuses, type AgentStatus } from "@/features/agents/interfaces/agents.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const statusTones: Record<AgentStatus, StatusTone> = {
  [AgentStatuses.ACTIVE]: StatusTones.SUCCESS,
  [AgentStatuses.DRAFT]: StatusTones.WARNING,
  [AgentStatuses.INACTIVE]: StatusTones.NEUTRAL,
};

export const AgentStatusBadge: FC<{ status: AgentStatus }> = ({ status }) => (
  <StatusBadge tone={statusTones[status]} dot>
    {getDropdownOptionLabel(AgentStatusFormOptions, status)}
  </StatusBadge>
);
