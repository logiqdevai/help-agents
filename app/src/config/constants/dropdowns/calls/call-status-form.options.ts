import { CallStatuses, type CallStatus } from "@/features/calls/interfaces/calls.interfaces";

export const CallStatusFormOptions: { id: CallStatus; label: string }[] = [
  { id: CallStatuses.COMPLETED, label: "Completed" },
  { id: CallStatuses.TRANSFERRED, label: "Transferred" },
  { id: CallStatuses.IN_PROGRESS, label: "In progress" },
  { id: CallStatuses.RINGING, label: "Ringing" },
  { id: CallStatuses.QUEUED, label: "Queued" },
  { id: CallStatuses.NO_ANSWER, label: "No answer" },
  { id: CallStatuses.BUSY, label: "Busy" },
  { id: CallStatuses.FAILED, label: "Failed" },
  { id: CallStatuses.SCHEDULED, label: "Scheduled" },
  { id: CallStatuses.CANCELED, label: "Canceled" },
];
