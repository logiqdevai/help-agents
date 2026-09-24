import { ScheduledCallSourceFormOptions } from "@/config/constants/dropdowns/calls/scheduled-call-source-form.options";
import type { ScheduledCallSource } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

export const ScheduledCallSourceFilterOptions: { id: ScheduledCallSource | "all"; label: string }[] = [
  { id: "all", label: "Any source" },
  ...ScheduledCallSourceFormOptions,
];
