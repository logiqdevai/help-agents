import {
  PhoneNumberTabs,
  type PhoneNumberTab,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";

export const PhoneNumberTabFilterOptions: { id: PhoneNumberTab; label: string }[] = [
  { id: PhoneNumberTabs.ALL, label: "All" },
  { id: PhoneNumberTabs.ACTIVE, label: "Active" },
  { id: PhoneNumberTabs.ATTENTION, label: "Needs attention" },
];
