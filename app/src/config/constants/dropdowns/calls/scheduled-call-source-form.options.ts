import {
  ScheduledCallSources,
  type ScheduledCallSource,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduledCallSourceFormOptions: { id: ScheduledCallSource; label: string }[] = [
  { id: ScheduledCallSources.MANUAL, label: "Manual" },
  { id: ScheduledCallSources.RETRY, label: "Retry" },
  { id: ScheduledCallSources.AUTOMATION, label: "Automation" },
  { id: ScheduledCallSources.FOLLOW_UP, label: "Follow-up" },
];
