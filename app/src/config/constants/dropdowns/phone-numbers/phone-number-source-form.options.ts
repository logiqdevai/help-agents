import {
  PhoneNumberSources,
  type PhoneNumberSource,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";

/** The two ways to add a number, shown as choice cards in the add dialog. */
export const PhoneNumberSourceFormOptions: { id: PhoneNumberSource; label: string; description: string }[] = [
  {
    id: PhoneNumberSources.PROVISIONED,
    label: "Get a new number",
    description: "We get a number for you. Ready to use right away.",
  },
  {
    id: PhoneNumberSources.BYO,
    label: "Bring your own number",
    description: "Keep the number your customers already recognise.",
  },
];
