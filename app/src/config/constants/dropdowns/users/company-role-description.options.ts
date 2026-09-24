import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

// Role summaries from docs/Product_Specification.md §3.
export const CompanyRoleDescriptionOptions: { id: CompanyRole; description: string }[] = [
  { id: CompanyRoles.OWNER, description: "Full access to everything, including deleting the company." },
  {
    id: CompanyRoles.ADMIN,
    description: "Can manage agents, integrations, knowledge, team members, and settings.",
  },
  { id: CompanyRoles.MEMBER, description: "Can use and view the agents and calls they have been given access to." },
  { id: CompanyRoles.VIEWER, description: "Read-only access; can look but not change anything." },
];

export function getCompanyRoleDescription(role: CompanyRole | string): string {
  return CompanyRoleDescriptionOptions.find((option) => option.id === role)?.description ?? "";
}
