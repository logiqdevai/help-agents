import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

export const CompanyRoleFormOptions: { id: CompanyRole; label: string }[] = [
  { id: CompanyRoles.OWNER, label: "Owner" },
  { id: CompanyRoles.ADMIN, label: "Admin" },
  { id: CompanyRoles.MEMBER, label: "Member" },
  { id: CompanyRoles.VIEWER, label: "Viewer" },
];

export function getCompanyRoleLabel(role: CompanyRole | string): string {
  return CompanyRoleFormOptions.find((option) => option.id === role)?.label ?? role;
}
