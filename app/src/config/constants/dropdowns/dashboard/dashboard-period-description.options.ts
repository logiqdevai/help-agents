import { DashboardPeriods, type DashboardPeriod } from "@/features/dashboard/interfaces/dashboard.interfaces";

/** Wording that changes with the selected period (tile titles, comparisons, chart legend). */
export const DashboardPeriodDescriptionOptions: {
  id: DashboardPeriod;
  /** Tile title: "Calls today" */
  callsLabel: string;
  /** Tile title: "AI cost today" */
  aiCostLabel: string;
  /** After "vs.": "vs. yesterday" */
  comparison: string;
  /** Header sentence: "Here is what your agents did today." */
  summary: string;
  /** Chart legend for the selected window. */
  currentLabel: string;
  /** Chart legend for the window before it. */
  previousLabel: string;
}[] = [
  {
    id: DashboardPeriods.TODAY,
    callsLabel: "Calls today",
    aiCostLabel: "AI cost today",
    comparison: "yesterday",
    summary: "today",
    currentLabel: "Today",
    previousLabel: "Yesterday",
  },
  {
    id: DashboardPeriods.LAST_7_DAYS,
    callsLabel: "Calls, last 7 days",
    aiCostLabel: "AI cost, last 7 days",
    comparison: "the previous 7 days",
    summary: "over the last 7 days",
    currentLabel: "Last 7 days",
    previousLabel: "Previous 7 days",
  },
  {
    id: DashboardPeriods.LAST_30_DAYS,
    callsLabel: "Calls, last 30 days",
    aiCostLabel: "AI cost, last 30 days",
    comparison: "the previous 30 days",
    summary: "over the last 30 days",
    currentLabel: "Last 30 days",
    previousLabel: "Previous 30 days",
  },
];

export function getDashboardPeriodDescription(period: DashboardPeriod) {
  return DashboardPeriodDescriptionOptions.find((option) => option.id === period) ?? DashboardPeriodDescriptionOptions[0];
}
