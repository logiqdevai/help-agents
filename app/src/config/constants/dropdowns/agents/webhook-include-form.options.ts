import {
  WebhookIncludeKeys,
  type WebhookIncludeKey,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** The parts of a call that can be sent to another system. */
export const WebhookIncludeFormOptions: { id: WebhookIncludeKey; label: string; description: string }[] = [
  { id: WebhookIncludeKeys.CALL, label: "Call details", description: "Status, outcome, duration and times." },
  { id: WebhookIncludeKeys.CONTACT, label: "Contact", description: "Name, phone number and email." },
  { id: WebhookIncludeKeys.GATHERED, label: "Information collected", description: "The answers the agent gathered." },
  { id: WebhookIncludeKeys.SUMMARY, label: "Summary", description: "A short summary of the call." },
  { id: WebhookIncludeKeys.TRANSCRIPT, label: "Transcript", description: "The full conversation." },
];
