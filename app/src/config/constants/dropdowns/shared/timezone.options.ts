export const TimezoneFormOptions: { id: string; label: string }[] = [
  { id: "UTC", label: "UTC" },
  { id: "Europe/Athens", label: "Europe/Athens" },
  { id: "Europe/London", label: "Europe/London" },
  { id: "Europe/Dublin", label: "Europe/Dublin" },
  { id: "Europe/Lisbon", label: "Europe/Lisbon" },
  { id: "Europe/Madrid", label: "Europe/Madrid" },
  { id: "Europe/Paris", label: "Europe/Paris" },
  { id: "Europe/Amsterdam", label: "Europe/Amsterdam" },
  { id: "Europe/Brussels", label: "Europe/Brussels" },
  { id: "Europe/Berlin", label: "Europe/Berlin" },
  { id: "Europe/Zurich", label: "Europe/Zurich" },
  { id: "Europe/Rome", label: "Europe/Rome" },
  { id: "Europe/Vienna", label: "Europe/Vienna" },
  { id: "Europe/Warsaw", label: "Europe/Warsaw" },
  { id: "Europe/Stockholm", label: "Europe/Stockholm" },
  { id: "Europe/Helsinki", label: "Europe/Helsinki" },
  { id: "Europe/Bucharest", label: "Europe/Bucharest" },
  { id: "Europe/Istanbul", label: "Europe/Istanbul" },
  { id: "Asia/Nicosia", label: "Asia/Nicosia" },
  { id: "Asia/Dubai", label: "Asia/Dubai" },
  { id: "Asia/Kolkata", label: "Asia/Kolkata" },
  { id: "Asia/Singapore", label: "Asia/Singapore" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo" },
  { id: "Australia/Sydney", label: "Australia/Sydney" },
  { id: "Pacific/Auckland", label: "Pacific/Auckland" },
  { id: "America/Sao_Paulo", label: "America/Sao_Paulo" },
  { id: "America/New_York", label: "America/New_York" },
  { id: "America/Chicago", label: "America/Chicago" },
  { id: "America/Denver", label: "America/Denver" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles" },
  { id: "America/Toronto", label: "America/Toronto" },
];

/**
 * The static list plus the caller's current value when it is not part of it,
 * so a saved timezone is never silently replaced by the first option.
 */
export function getTimezoneOptions(current?: string | null): { id: string; label: string }[] {
  if (!current || TimezoneFormOptions.some((option) => option.id === current)) return TimezoneFormOptions;
  return [{ id: current, label: current }, ...TimezoneFormOptions];
}
