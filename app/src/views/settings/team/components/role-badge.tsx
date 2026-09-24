import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

const roleBadgeVariant: Record<CompanyRole, "default" | "outline"> = {
  [CompanyRoles.OWNER]: "default",
  [CompanyRoles.ADMIN]: "outline",
  [CompanyRoles.MEMBER]: "default",
  [CompanyRoles.VIEWER]: "outline",
};

/** Owner is the only filled (ink) badge; the other roles stay quiet. */
export const RoleBadge: FC<{ role: CompanyRole }> = ({ role }) => (
  <Badge
    variant={roleBadgeVariant[role]}
    className={role === CompanyRoles.OWNER ? "bg-primary text-primary-foreground" : undefined}
  >
    {getDropdownOptionLabel(CompanyRoleFormOptions, role)}
  </Badge>
);
