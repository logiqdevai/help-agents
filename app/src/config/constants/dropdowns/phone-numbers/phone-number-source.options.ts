import {
  PhoneNumberSources,
  type PhoneNumberSource,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";

export const PhoneNumberSourceOptions: { id: PhoneNumberSource; label: string }[] = [
  { id: PhoneNumberSources.PROVISIONED, label: "Provisioned by platform" },
  { id: PhoneNumberSources.BYO, label: "Your own number" },
];
