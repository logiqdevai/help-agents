import { TranscriptRoles, type TranscriptRole } from "@/features/calls/interfaces/calls.interfaces";

export const CallTranscriptRoleFormOptions: { id: TranscriptRole; label: string }[] = [
  { id: TranscriptRoles.AGENT, label: "Agent" },
  { id: TranscriptRoles.CUSTOMER, label: "Caller" },
];
