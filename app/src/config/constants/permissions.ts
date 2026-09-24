import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

// Mirror of api/src/shared/permissions/permissions.ts — the API is the source of truth and enforces
// every check; the UI only uses this to hide or disable actions the caller cannot perform.
export const Permissions = {
  COMPANY_READ: "company.read",
  COMPANY_MANAGE: "company.manage",
  COMPANY_DELETE: "company.delete",
  TEAM_READ: "team.read",
  TEAM_MANAGE: "team.manage",
  AGENTS_READ: "agents.read",
  AGENTS_WRITE: "agents.write",
  INTEGRATIONS_READ: "integrations.read",
  INTEGRATIONS_MANAGE: "integrations.manage",
  KNOWLEDGE_READ: "knowledge.read",
  KNOWLEDGE_WRITE: "knowledge.write",
  PHONE_NUMBERS_READ: "phone_numbers.read",
  PHONE_NUMBERS_MANAGE: "phone_numbers.manage",
  CALLS_READ: "calls.read",
  CALLS_PLACE: "calls.place",
  CALLS_MANAGE: "calls.manage",
  CONTACTS_READ: "contacts.read",
  CONTACTS_WRITE: "contacts.write",
  SCHEDULING_READ: "scheduling.read",
  SCHEDULING_MANAGE: "scheduling.manage",
  AUTOMATION_READ: "automation.read",
  AUTOMATION_MANAGE: "automation.manage",
  ANALYTICS_READ: "analytics.read",
  ACTIVITY_READ: "activity.read",
  ALERTS_READ: "alerts.read",
  ALERTS_MANAGE: "alerts.manage",
} as const;
export type Permission = (typeof Permissions)[keyof typeof Permissions];

const ALL = Object.values(Permissions) as Permission[];

const VIEWER: Permission[] = [
  Permissions.COMPANY_READ,
  Permissions.TEAM_READ,
  Permissions.AGENTS_READ,
  Permissions.INTEGRATIONS_READ,
  Permissions.KNOWLEDGE_READ,
  Permissions.PHONE_NUMBERS_READ,
  Permissions.CALLS_READ,
  Permissions.CONTACTS_READ,
  Permissions.SCHEDULING_READ,
  Permissions.AUTOMATION_READ,
  Permissions.ANALYTICS_READ,
  Permissions.ALERTS_READ,
];

const MEMBER: Permission[] = [
  ...VIEWER,
  Permissions.CALLS_PLACE,
  Permissions.CONTACTS_WRITE,
  Permissions.SCHEDULING_MANAGE,
];

export const RolePermissions: Record<CompanyRole, Permission[]> = {
  [CompanyRoles.OWNER]: ALL,
  [CompanyRoles.ADMIN]: ALL.filter((p) => p !== Permissions.COMPANY_DELETE),
  [CompanyRoles.MEMBER]: MEMBER,
  [CompanyRoles.VIEWER]: VIEWER,
};
