import { ScheduleModes, type ScheduleMode } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduleModeFormOptions: { id: ScheduleMode; label: string }[] = [
  { id: ScheduleModes.IMMEDIATELY, label: "Call immediately" },
  { id: ScheduleModes.AFTER_MINUTES, label: "After a set number of minutes" },
  { id: ScheduleModes.TOMORROW, label: "Tomorrow" },
  { id: ScheduleModes.DATE, label: "On a specific date" },
];
