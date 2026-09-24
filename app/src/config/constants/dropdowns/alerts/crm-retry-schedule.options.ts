// Mirrors ACTION_RETRY_DELAYS_MINUTES in the API (api/src/modules/call-engine/call-engine.constants.ts).
export const CrmRetryScheduleOptions: { id: number; label: string }[] = [
  { id: 1, label: "after 1 minute" },
  { id: 2, label: "after 5 minutes" },
  { id: 3, label: "after 30 minutes" },
  { id: 4, label: "after 2 hours" },
];
