// Why a scheduled call was closed without a call. The API stores either a code or a plain sentence;
// codes are matched by prefix because some carry a suffix such as ": gave up after 3 tries".
export const ScheduledCallReasonFormOptions: { id: string; label: string }[] = [
  { id: "AGENT_NOT_ACTIVE", label: "The agent was not active" },
  { id: "AGENT_NOT_SYNCED", label: "The agent was not ready to make calls" },
  { id: "CONTACT_DO_NOT_CALL", label: "Contact is marked “Do not call”" },
  { id: "CONTACT_NOT_FOUND", label: "The contact no longer exists" },
  { id: "INVALID_PHONE_NUMBER", label: "Invalid phone number" },
  { id: "NO_PHONE_NUMBER_AVAILABLE", label: "The agent has no phone number to call from" },
  { id: "PROVIDER_UNAVAILABLE", label: "The calling service was unavailable" },
  { id: "PLACEMENT_FAILED", label: "The call could not be placed" },
  { id: "stuck_in_progress", label: "The call did not start and was reset" },
];

export function getScheduledCallReasonLabel(reason: string | null): string {
  if (!reason) return "";
  return ScheduledCallReasonFormOptions.find((option) => reason.startsWith(option.id))?.label ?? reason;
}
