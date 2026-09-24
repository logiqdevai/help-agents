// day_of_week follows the API: 0 = Sunday ... 6 = Saturday. Listed Monday-first for display.
export const WeekdayFormOptions: { id: number; label: string }[] = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

export function getWeekdayLabel(dayOfWeek: number): string {
  return WeekdayFormOptions.find((option) => option.id === dayOfWeek)?.label ?? String(dayOfWeek);
}
