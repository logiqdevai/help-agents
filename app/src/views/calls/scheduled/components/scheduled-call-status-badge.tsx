import type { FC } from "react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { ScheduledCallStatusFormOptions } from "@/config/constants/dropdowns/calls/scheduled-call-status-form.options";
import {
  ScheduledCallStatuses,
  type ScheduledCallStatus,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const statusTones: Record<ScheduledCallStatus, StatusTone> = {
  [ScheduledCallStatuses.PENDING]: StatusTones.NEUTRAL,
  [ScheduledCallStatuses.IN_PROGRESS]: StatusTones.INFO,
  [ScheduledCallStatuses.COMPLETED]: StatusTones.SUCCESS,
  [ScheduledCallStatuses.FAILED]: StatusTones.DANGER,
  [ScheduledCallStatuses.CANCELED]: StatusTones.NEUTRAL,
  [ScheduledCallStatuses.SKIPPED]: StatusTones.NEUTRAL,
};

export const ScheduledCallStatusBadge: FC<{ status: ScheduledCallStatus }> = ({ status }) => (
  <StatusBadge tone={statusTones[status]} dot={status === ScheduledCallStatuses.IN_PROGRESS}>
    {getDropdownOptionLabel(ScheduledCallStatusFormOptions, status)}
  </StatusBadge>
);
