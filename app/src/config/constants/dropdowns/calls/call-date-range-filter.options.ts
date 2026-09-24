import { CallDateRanges, type CallDateRange } from "@/features/calls/interfaces/calls.interfaces";

export const CallDateRangeFilterOptions: { id: CallDateRange | "all"; label: string }[] = [
  { id: "all", label: "Any time" },
  { id: CallDateRanges.TODAY, label: "Today" },
  { id: CallDateRanges.LAST_7_DAYS, label: "Last 7 days" },
  { id: CallDateRanges.LAST_30_DAYS, label: "Last 30 days" },
  { id: CallDateRanges.CUSTOM, label: "Custom range…" },
];
