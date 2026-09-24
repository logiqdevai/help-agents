import { AlertTypes, type AlertType } from "@/features/alerts/interfaces/alerts.interfaces";

export const AlertTypeFormOptions: { id: AlertType; label: string }[] = [
  { id: AlertTypes.CRM_UPDATE_FAILED, label: "CRM update failed" },
  { id: AlertTypes.INTEGRATION_FAILED, label: "Connection failing" },
  { id: AlertTypes.CALL_FAILED, label: "Call failed" },
  { id: AlertTypes.INVALID_PHONE_NUMBER, label: "Invalid phone number" },
  { id: AlertTypes.NO_PHONE_NUMBER_AVAILABLE, label: "No phone number available" },
  { id: AlertTypes.AI_SERVICE_UNAVAILABLE, label: "AI service unavailable" },
  { id: AlertTypes.KNOWLEDGE_PROCESSING_FAILED, label: "Knowledge processing failed" },
  { id: AlertTypes.OTHER, label: "Other" },
];
