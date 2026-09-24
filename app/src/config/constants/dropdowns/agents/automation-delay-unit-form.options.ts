import { DelayUnits, type DelayUnit } from "@/features/automation-rules/interfaces/automation-rules.interfaces";

export const AutomationDelayUnitFormOptions: { id: DelayUnit; label: string }[] = [
  { id: DelayUnits.MINUTES, label: "minutes" },
  { id: DelayUnits.HOURS, label: "hours" },
  { id: DelayUnits.DAYS, label: "days" },
];
