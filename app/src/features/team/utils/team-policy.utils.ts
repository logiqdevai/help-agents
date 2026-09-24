import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

// Mirror of api/src/modules/companies/utils/team-policy.utils.ts. The API enforces the rules;
// the UI only uses this to hide actions the caller cannot perform.
const ROLE_RANK: Record<CompanyRole, number> = {
  [CompanyRoles.VIEWER]: 1,
  [CompanyRoles.MEMBER]: 2,
  [CompanyRoles.ADMIN]: 3,
  [CompanyRoles.OWNER]: 4,
};

/** Owners manage everyone; admins manage roles strictly below admin; others manage nobody. */
export function canManageRole(actor: CompanyRole | undefined, target: CompanyRole): boolean {
  if (actor === CompanyRoles.OWNER) return true;
  if (actor === CompanyRoles.ADMIN) return ROLE_RANK[target] < ROLE_RANK[CompanyRoles.ADMIN];
  return false;
}
