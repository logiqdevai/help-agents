import type { FC } from "react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { IntegrationStatusOptions } from "@/config/constants/dropdowns/integrations/integration-status.options";
import {
  IntegrationStatuses,
  type IntegrationStatus,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const StatusTonesByStatus: Record<IntegrationStatus, StatusTone> = {
  [IntegrationStatuses.ACTIVE]: StatusTones.SUCCESS,
  [IntegrationStatuses.ERROR]: StatusTones.DANGER,
  [IntegrationStatuses.PENDING]: StatusTones.WARNING,
  [IntegrationStatuses.DISCONNECTED]: StatusTones.NEUTRAL,
};

export const IntegrationStatusBadge: FC<{ status: IntegrationStatus }> = ({ status }) => (
  <StatusBadge tone={StatusTonesByStatus[status]} dot>
    {getDropdownOptionLabel(IntegrationStatusOptions, status)}
  </StatusBadge>
);
