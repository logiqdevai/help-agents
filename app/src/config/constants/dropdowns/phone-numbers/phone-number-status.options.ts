import {
  PhoneNumberStatuses,
  type PhoneNumberStatus,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";

export const PhoneNumberStatusOptions: { id: PhoneNumberStatus; label: string }[] = [
  { id: PhoneNumberStatuses.PENDING, label: "Pending" },
  { id: PhoneNumberStatuses.ACTIVE, label: "Active" },
  { id: PhoneNumberStatuses.ERROR, label: "Error" },
  { id: PhoneNumberStatuses.RELEASED, label: "Released" },
];
