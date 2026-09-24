import type { FC } from "react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { CallStatusFormOptions } from "@/config/constants/dropdowns/calls/call-status-form.options";
import { CallStatuses, LiveCallStatuses, type CallStatus } from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const statusTones: Record<CallStatus, StatusTone> = {
  [CallStatuses.COMPLETED]: StatusTones.SUCCESS,
  [CallStatuses.TRANSFERRED]: StatusTones.INFO,
  [CallStatuses.IN_PROGRESS]: StatusTones.INFO,
  [CallStatuses.RINGING]: StatusTones.INFO,
  [CallStatuses.QUEUED]: StatusTones.INFO,
  [CallStatuses.NO_ANSWER]: StatusTones.NEUTRAL,
  [CallStatuses.BUSY]: StatusTones.NEUTRAL,
  [CallStatuses.FAILED]: StatusTones.DANGER,
  [CallStatuses.SCHEDULED]: StatusTones.NEUTRAL,
  [CallStatuses.CANCELED]: StatusTones.NEUTRAL,
};

interface CallStatusBadgeProps {
  status: CallStatus;
}

export const CallStatusBadge: FC<CallStatusBadgeProps> = ({ status }) => (
  <StatusBadge tone={statusTones[status]} dot={LiveCallStatuses.includes(status)}>
    {getDropdownOptionLabel(CallStatusFormOptions, status)}
  </StatusBadge>
);
