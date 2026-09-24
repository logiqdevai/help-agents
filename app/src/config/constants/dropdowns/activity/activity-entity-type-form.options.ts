import { ActivityEntityTypes, type ActivityEntityType } from "@/features/activity-log/interfaces/activity-log.interfaces";

// Singular names, used when a record has no name of its own to show.
export const ActivityEntityTypeFormOptions: { id: ActivityEntityType; label: string }[] = [
  { id: ActivityEntityTypes.AGENT, label: "Agent" },
  { id: ActivityEntityTypes.ALERT, label: "Alert" },
  { id: ActivityEntityTypes.AUTOMATION_RULE, label: "Automation rule" },
  { id: ActivityEntityTypes.CALL, label: "Call" },
  { id: ActivityEntityTypes.CALL_ACTION, label: "CRM update" },
  { id: ActivityEntityTypes.COMPANY, label: "Company" },
  { id: ActivityEntityTypes.COMPANY_INVITATION, label: "Invitation" },
  { id: ActivityEntityTypes.COMPANY_MEMBER, label: "Team member" },
  { id: ActivityEntityTypes.CONTACT, label: "Contact" },
  { id: ActivityEntityTypes.CRM_TOOL, label: "CRM action" },
  { id: ActivityEntityTypes.INTEGRATION, label: "Integration" },
  { id: ActivityEntityTypes.KNOWLEDGE_SOURCE, label: "Knowledge source" },
  { id: ActivityEntityTypes.PHONE_NUMBER, label: "Phone number" },
  { id: ActivityEntityTypes.SCHEDULED_CALL, label: "Scheduled call" },
];
