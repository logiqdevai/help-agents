import {
  ScheduledCallTabs,
  type ScheduledCallTab,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduledCallTabFormOptions: { id: ScheduledCallTab; label: string }[] = [
  { id: ScheduledCallTabs.PENDING, label: "Pending" },
  { id: ScheduledCallTabs.COMPLETED, label: "Completed" },
  { id: ScheduledCallTabs.CANCELED, label: "Canceled & skipped" },
];
