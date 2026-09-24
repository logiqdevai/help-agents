import { DashboardPeriods, type DashboardPeriod } from "@/features/dashboard/interfaces/dashboard.interfaces";

export const DashboardPeriodFormOptions: { id: DashboardPeriod; label: string }[] = [
  { id: DashboardPeriods.TODAY, label: "Today" },
  { id: DashboardPeriods.LAST_7_DAYS, label: "7 days" },
  { id: DashboardPeriods.LAST_30_DAYS, label: "30 days" },
];
