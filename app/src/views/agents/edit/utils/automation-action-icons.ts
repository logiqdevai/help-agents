import {
  BanIcon,
  CalendarClockIcon,
  CalendarIcon,
  DatabaseIcon,
  FileTextIcon,
  ListChecksIcon,
  MailIcon,
  MessageSquareIcon,
  WebhookIcon,
  type LucideIcon,
} from "lucide-react";
import {
  AutomationActionTypes,
  type AutomationActionType,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

export const AutomationActionIcons: Record<AutomationActionType, LucideIcon> = {
  [AutomationActionTypes.UPDATE_CRM]: DatabaseIcon,
  [AutomationActionTypes.ADD_CRM_NOTE]: FileTextIcon,
  [AutomationActionTypes.CREATE_CRM_TASK]: ListChecksIcon,
  [AutomationActionTypes.SCHEDULE_FOLLOW_UP]: CalendarClockIcon,
  [AutomationActionTypes.CANCEL_FOLLOW_UPS]: BanIcon,
  [AutomationActionTypes.CREATE_CALENDAR_EVENT]: CalendarIcon,
  [AutomationActionTypes.SEND_EMAIL]: MailIcon,
  [AutomationActionTypes.SEND_SMS]: MessageSquareIcon,
  [AutomationActionTypes.WEBHOOK]: WebhookIcon,
};
