export const ChartViews = {
  CHART: "chart",
  TABLE: "table",
} as const
export type ChartView = (typeof ChartViews)[keyof typeof ChartViews]

export const ChartViewFormOptions: { id: ChartView; label: string }[] = [
  { id: ChartViews.CHART, label: "Chart" },
  { id: ChartViews.TABLE, label: "Table" },
]
