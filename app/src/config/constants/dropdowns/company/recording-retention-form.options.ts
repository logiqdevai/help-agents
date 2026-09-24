/** `null` keeps recordings until they are deleted manually. */
export const RecordingRetentionFormOptions: { id: number | null; label: string }[] = [
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
  { id: 180, label: "180 days" },
  { id: 365, label: "365 days" },
  { id: null, label: "Forever" },
];

/** The preset list plus the stored value when it is a custom number of days set through the API. */
export function getRecordingRetentionOptions(
  current: number | null | undefined,
): { id: number | null; label: string }[] {
  if (current === null || current === undefined || RecordingRetentionFormOptions.some((o) => o.id === current)) {
    return RecordingRetentionFormOptions;
  }
  return [{ id: current, label: `${current} days` }, ...RecordingRetentionFormOptions];
}
