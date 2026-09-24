import type { FC } from "react";
import { StatusBadge, StatusTones, type StatusTone } from "@/components/ui/status-badge";
import { PhoneNumberStatusOptions } from "@/config/constants/dropdowns/phone-numbers/phone-number-status.options";
import {
  PhoneNumberStatuses,
  type PhoneNumberStatus,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const statusTone: Record<PhoneNumberStatus, StatusTone> = {
  [PhoneNumberStatuses.ACTIVE]: StatusTones.SUCCESS,
  [PhoneNumberStatuses.PENDING]: StatusTones.WARNING,
  [PhoneNumberStatuses.ERROR]: StatusTones.DANGER,
  [PhoneNumberStatuses.RELEASED]: StatusTones.NEUTRAL,
};

interface PhoneNumberStatusBadgeProps {
  status: PhoneNumberStatus;
}

export const PhoneNumberStatusBadge: FC<PhoneNumberStatusBadgeProps> = ({ status }) => (
  <StatusBadge tone={statusTone[status]} dot>
    {getDropdownOptionLabel(PhoneNumberStatusOptions, status)}
  </StatusBadge>
);
