import { AlertTypeFormOptions } from "@/config/constants/dropdowns/alerts/alert-type-form.options";
import type { AlertType } from "@/features/alerts/interfaces/alerts.interfaces";

export const AlertTypeFilterOptions: { id: AlertType | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  ...AlertTypeFormOptions,
];
