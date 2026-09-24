import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

// Bullet summaries from docs/Product_Specification.md §3, shown in the "What each role can do" explainer.
export const CompanyRoleCapabilityOptions: { id: CompanyRole; capabilities: string[] }[] = [
  {
    id: CompanyRoles.OWNER,
    capabilities: ["Full access to everything", "Billing and usage", "Delete the company account"],
  },
  {
    id: CompanyRoles.ADMIN,
    capabilities: ["Manage agents and integrations", "Manage knowledge", "Manage team members and settings"],
  },
  {
    id: CompanyRoles.MEMBER,
    capabilities: [
      "Use and view the agents and calls they have been given access to",
      "Can be limited to specific agents",
    ],
  },
  { id: CompanyRoles.VIEWER, capabilities: ["Read-only: can look, cannot change anything"] },
];
