import { RecipientModes, type RecipientMode } from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** Who an automatic email or text message goes to. */
export const AutomationRecipientFormOptions: { id: RecipientMode; label: string }[] = [
  { id: RecipientModes.CONTACT, label: "The contact from the call" },
  { id: RecipientModes.CUSTOM, label: "Someone else" },
];
