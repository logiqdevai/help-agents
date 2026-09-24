export const ActivityPeriods = {
  LAST_7_DAYS: "7d",
  TODAY: "today",
  LAST_30_DAYS: "30d",
  CUSTOM: "custom",
} as const;
export type ActivityPeriod = (typeof ActivityPeriods)[keyof typeof ActivityPeriods];

export const ActivityPeriodFilterOptions: { id: ActivityPeriod; label: string }[] = [
  { id: ActivityPeriods.LAST_7_DAYS, label: "Last 7 days" },
  { id: ActivityPeriods.TODAY, label: "Today" },
  { id: ActivityPeriods.LAST_30_DAYS, label: "Last 30 days" },
  { id: ActivityPeriods.CUSTOM, label: "Custom range…" },
];
