import { CallDirectionFormOptions } from "@/config/constants/dropdowns/calls/call-direction-form.options";
import type { CallDirection } from "@/features/calls/interfaces/calls.interfaces";

export const CallDirectionFilterOptions: { id: CallDirection | "all"; label: string }[] = [
  { id: "all", label: "Any direction" },
  ...CallDirectionFormOptions,
];
