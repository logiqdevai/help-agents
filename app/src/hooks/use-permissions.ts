import { useMemo } from "react";
import { RolePermissions, type Permission } from "@/config/constants/permissions";
import { useAuthStore } from "@/stores/auth";

/**
 * Permission checks for the active company, derived from the caller's role.
 * `can(Permissions.AGENTS_WRITE)` — use it to hide/disable actions; the API enforces the real check.
 */
export function usePermissions() {
  const role = useAuthStore((state) => state.companies.find((c) => c.id === state.activeCompanyId)?.role);
  return useMemo(() => {
    const granted = new Set<string>(role ? RolePermissions[role] : []);
    return {
      role,
      can: (permission: Permission) => granted.has(permission),
      canAll: (...permissions: Permission[]) => permissions.every((p) => granted.has(p)),
    };
  }, [role]);
}
