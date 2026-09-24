import { RetryHoursModes, type RetryHoursMode } from "@/features/agents/interfaces/agents.interfaces";

/** Which calling hours the retries of an agent follow. */
export const RetryHoursFormOptions: { id: RetryHoursMode; label: string; description: string }[] = [
  {
    id: RetryHoursModes.COMPANY,
    label: "Use company calling hours",
    description: "Retries follow the hours set for your whole company.",
  },
  {
    id: RetryHoursModes.CUSTOM,
    label: "Custom hours for this agent",
    description: "Set different windows just for retries. They can narrow the company hours, never widen them.",
  },
];
