import {
  AutomationActionTypes,
  type AutomationActionType,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** Short names for what an automation does after a call, e.g. "Update the CRM". */
export const AutomationActionTypeFormOptions: { id: AutomationActionType; label: string }[] = [
  { id: AutomationActionTypes.UPDATE_CRM, label: "Update the CRM" },
  { id: AutomationActionTypes.ADD_CRM_NOTE, label: "Add a CRM note" },
  { id: AutomationActionTypes.CREATE_CRM_TASK, label: "Create a CRM task" },
  { id: AutomationActionTypes.SCHEDULE_FOLLOW_UP, label: "Schedule a follow-up call" },
  { id: AutomationActionTypes.CANCEL_FOLLOW_UPS, label: "Close the follow-up" },
  { id: AutomationActionTypes.CREATE_CALENDAR_EVENT, label: "Create a calendar event" },
  { id: AutomationActionTypes.SEND_EMAIL, label: "Send an email" },
  { id: AutomationActionTypes.SEND_SMS, label: "Send a text message" },
  { id: AutomationActionTypes.WEBHOOK, label: "Notify another system" },
];
