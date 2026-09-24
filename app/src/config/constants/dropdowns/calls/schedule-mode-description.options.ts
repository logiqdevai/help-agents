import { ScheduleModes, type ScheduleMode } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduleModeDescriptionOptions: { id: ScheduleMode; description: string }[] = [
  { id: ScheduleModes.IMMEDIATELY, description: "Placed as soon as the contact is eligible." },
  { id: ScheduleModes.AFTER_MINUTES, description: "For example, in 30 minutes." },
  { id: ScheduleModes.TOMORROW, description: "At the first allowed time tomorrow." },
  { id: ScheduleModes.DATE, description: "Pick a day and time." },
];

export function getScheduleModeDescription(mode: ScheduleMode): string {
  return ScheduleModeDescriptionOptions.find((option) => option.id === mode)?.description ?? "";
}
