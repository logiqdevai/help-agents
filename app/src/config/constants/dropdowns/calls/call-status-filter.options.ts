import { CallStatusFormOptions } from "@/config/constants/dropdowns/calls/call-status-form.options";
import type { CallStatus } from "@/features/calls/interfaces/calls.interfaces";

export const CallStatusFilterOptions: { id: CallStatus | "all"; label: string }[] = [
  { id: "all", label: "All statuses" },
  ...CallStatusFormOptions,
];
