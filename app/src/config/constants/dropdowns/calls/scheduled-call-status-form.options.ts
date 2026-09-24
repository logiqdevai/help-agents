import {
  ScheduledCallStatuses,
  type ScheduledCallStatus,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduledCallStatusFormOptions: { id: ScheduledCallStatus; label: string }[] = [
  { id: ScheduledCallStatuses.PENDING, label: "Pending" },
  { id: ScheduledCallStatuses.IN_PROGRESS, label: "In progress" },
  { id: ScheduledCallStatuses.COMPLETED, label: "Completed" },
  { id: ScheduledCallStatuses.FAILED, label: "Failed" },
  { id: ScheduledCallStatuses.CANCELED, label: "Canceled" },
  { id: ScheduledCallStatuses.SKIPPED, label: "Skipped" },
];
