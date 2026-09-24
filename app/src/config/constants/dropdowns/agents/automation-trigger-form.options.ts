import {
  AutomationTriggers,
  type AutomationTrigger,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** What has to happen to a call for an automation rule to run. */
export const AutomationTriggerFormOptions: { id: AutomationTrigger; label: string }[] = [
  { id: AutomationTriggers.CALL_OUTCOME, label: "A call outcome is reached" },
  { id: AutomationTriggers.CALL_COMPLETED, label: "A call is completed" },
  { id: AutomationTriggers.CALL_FAILED, label: "A call fails" },
  { id: AutomationTriggers.CALL_TRANSFERRED, label: "A call is transferred" },
  { id: AutomationTriggers.VOICEMAIL_DETECTED, label: "Voicemail is detected" },
];
