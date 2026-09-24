import { UsagePeriods, type UsagePeriod } from "@/features/analytics/interfaces/analytics.interfaces";

export const UsagePeriodFormOptions: { id: UsagePeriod; label: string }[] = [
  { id: UsagePeriods.TODAY, label: "Today" },
  { id: UsagePeriods.LAST_7_DAYS, label: "Last 7 days" },
  { id: UsagePeriods.LAST_30_DAYS, label: "Last 30 days" },
  { id: UsagePeriods.CUSTOM, label: "Custom range" },
];
