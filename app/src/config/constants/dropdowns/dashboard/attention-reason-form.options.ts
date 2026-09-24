import {
  AttentionReasonTypes,
  type AttentionReasonType,
} from "@/features/dashboard/interfaces/dashboard.interfaces";

export const AttentionReasonFormOptions: { id: AttentionReasonType; label: string }[] = [
  { id: AttentionReasonTypes.CRM_UPDATE_FAILED, label: "CRM update failed" },
  { id: AttentionReasonTypes.CALL_FAILED, label: "Call failed to connect" },
];
