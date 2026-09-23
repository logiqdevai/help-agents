import { CompanyRole } from 'generated/prisma';
import { COMPANY_ROLE_RANK } from '@/shared/permissions/permissions';

/** OWNER manages everyone; ADMIN manages roles strictly below ADMIN; others manage nobody. */
export function canManageRole(actor: CompanyRole, target: CompanyRole): boolean {
  if (actor === CompanyRole.OWNER) return true;
  if (actor === CompanyRole.ADMIN) return COMPANY_ROLE_RANK[target] < COMPANY_ROLE_RANK[CompanyRole.ADMIN];
  return false;
}
