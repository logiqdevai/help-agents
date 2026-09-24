import { ActivityEntityTypes } from "@/features/activity-log/interfaces/activity-log.interfaces";

export const ActivityEntityGroups = {
  AGENTS: "agents",
  CALLS: "calls",
  KNOWLEDGE: "knowledge",
  INTEGRATIONS: "integrations",
  PHONE_NUMBERS: "phone_numbers",
  TEAM: "team",
  SETTINGS: "settings",
} as const;
export type ActivityEntityGroup = (typeof ActivityEntityGroups)[keyof typeof ActivityEntityGroups];

/** Filter groups; each one matches one or more API entity types. */
export const ActivityEntityGroupFilterOptions: {
  id: ActivityEntityGroup | "all";
  label: string;
  entityTypes: string[];
}[] = [
  { id: "all", label: "All entities", entityTypes: [] },
  { id: ActivityEntityGroups.AGENTS, label: "Agents", entityTypes: [ActivityEntityTypes.AGENT, ActivityEntityTypes.AUTOMATION_RULE] },
  {
    id: ActivityEntityGroups.CALLS,
    label: "Calls",
    entityTypes: [
      ActivityEntityTypes.CALL,
      ActivityEntityTypes.CALL_ACTION,
      ActivityEntityTypes.SCHEDULED_CALL,
      ActivityEntityTypes.CONTACT,
    ],
  },
  { id: ActivityEntityGroups.KNOWLEDGE, label: "Knowledge", entityTypes: [ActivityEntityTypes.KNOWLEDGE_SOURCE] },
  {
    id: ActivityEntityGroups.INTEGRATIONS,
    label: "Integrations",
    entityTypes: [ActivityEntityTypes.INTEGRATION, ActivityEntityTypes.CRM_TOOL],
  },
  { id: ActivityEntityGroups.PHONE_NUMBERS, label: "Phone numbers", entityTypes: [ActivityEntityTypes.PHONE_NUMBER] },
  {
    id: ActivityEntityGroups.TEAM,
    label: "Team",
    entityTypes: [ActivityEntityTypes.COMPANY_MEMBER, ActivityEntityTypes.COMPANY_INVITATION],
  },
  {
    id: ActivityEntityGroups.SETTINGS,
    label: "Settings",
    entityTypes: [ActivityEntityTypes.COMPANY, ActivityEntityTypes.ALERT],
  },
];
