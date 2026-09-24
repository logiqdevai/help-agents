import { RetryTriggers, type RetryTrigger } from "@/features/agents/interfaces/agents.interfaces";

/** What happened to a call that makes the platform try again. */
export const RetryTriggerFormOptions: { id: RetryTrigger; label: string }[] = [
  { id: RetryTriggers.NO_ANSWER, label: "No answer" },
  { id: RetryTriggers.BUSY, label: "Busy" },
  { id: RetryTriggers.FAILED, label: "Failed" },
  { id: RetryTriggers.VOICEMAIL, label: "Voicemail" },
];
