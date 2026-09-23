import { CompanyRole } from 'generated/prisma';

export const Permissions = {
  COMPANY_READ: 'company.read',
  COMPANY_MANAGE: 'company.manage',
  COMPANY_DELETE: 'company.delete',
  TEAM_READ: 'team.read',
  TEAM_MANAGE: 'team.manage',
  AGENTS_READ: 'agents.read',
  AGENTS_WRITE: 'agents.write',
  INTEGRATIONS_READ: 'integrations.read',
  INTEGRATIONS_MANAGE: 'integrations.manage',
  KNOWLEDGE_READ: 'knowledge.read',
  KNOWLEDGE_WRITE: 'knowledge.write',
  PHONE_NUMBERS_READ: 'phone_numbers.read',
  PHONE_NUMBERS_MANAGE: 'phone_numbers.manage',
  CALLS_READ: 'calls.read',
  CALLS_PLACE: 'calls.place',
  CALLS_MANAGE: 'calls.manage',
  CONTACTS_READ: 'contacts.read',
  CONTACTS_WRITE: 'contacts.write',
  SCHEDULING_READ: 'scheduling.read',
  SCHEDULING_MANAGE: 'scheduling.manage',
  AUTOMATION_READ: 'automation.read',
  AUTOMATION_MANAGE: 'automation.manage',
  ANALYTICS_READ: 'analytics.read',
  ACTIVITY_READ: 'activity.read',
  ALERTS_READ: 'alerts.read',
  ALERTS_MANAGE: 'alerts.manage',
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

const ADMIN: Permission[] = ALL.filter((p) => p !== Permissions.COMPANY_DELETE);

export const ROLE_PERMISSIONS: Record<CompanyRole, Permission[]> = {
  OWNER: ALL,
  ADMIN,
  MEMBER,
  VIEWER,
};

/** Role defaults plus any fine-grained grants stored on the membership. */
export function resolvePermissions(role: CompanyRole, extra: string[] = []): Set<string> {
  return new Set<string>([...ROLE_PERMISSIONS[role], ...extra]);
}

export const COMPANY_ROLE_RANK: Record<CompanyRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function isKnownPermission(value: string): value is Permission {
  return (ALL as string[]).includes(value);
}
