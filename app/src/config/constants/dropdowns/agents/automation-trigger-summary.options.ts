import {
  AutomationTriggers,
  type AutomationTrigger,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** The short form of a trigger in a rule's "When ..." line; a call outcome is followed by the outcome itself. */
export const AutomationTriggerSummaryOptions: { id: AutomationTrigger; label: string }[] = [
  { id: AutomationTriggers.CALL_OUTCOME, label: "Call outcome is" },
  { id: AutomationTriggers.CALL_COMPLETED, label: "A call is completed" },
  { id: AutomationTriggers.CALL_FAILED, label: "A call fails" },
  { id: AutomationTriggers.CALL_TRANSFERRED, label: "A call is transferred" },
  { id: AutomationTriggers.VOICEMAIL_DETECTED, label: "Voicemail is detected" },
];
