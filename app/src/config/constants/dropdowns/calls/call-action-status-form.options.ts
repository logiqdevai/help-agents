import { ActionStatuses, type ActionStatus } from "@/features/calls/interfaces/calls.interfaces";

export const CallActionStatusFormOptions: { id: ActionStatus; label: string }[] = [
  { id: ActionStatuses.REQUESTED, label: "Requested" },
  { id: ActionStatuses.APPROVED, label: "Validated" },
  { id: ActionStatuses.REJECTED, label: "Rejected" },
  { id: ActionStatuses.EXECUTED, label: "Executed" },
  { id: ActionStatuses.RETRYING, label: "Retrying" },
  { id: ActionStatuses.FAILED, label: "Failed" },
  { id: ActionStatuses.NEEDS_ATTENTION, label: "Needs attention" },
  { id: ActionStatuses.CANCELED, label: "Canceled" },
];
