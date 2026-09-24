import type { FC } from "react";
import { CheckIcon, EyeIcon, InfoIcon } from "lucide-react";
import { CompanyRoleCapabilityOptions } from "@/config/constants/dropdowns/users/company-role-capability.options";
import { CompanyRoles } from "@/features/auth/interfaces/auth.interfaces";
import { RoleBadge } from "./role-badge";

/** "What each role can do" (spec §3). */
export const RoleExplainer: FC = () => (
  <section className="flex flex-col gap-3" aria-labelledby="role-explainer-heading">
    <h2 id="role-explainer-heading" className="font-heading text-lg font-medium">
      What each role can do
    </h2>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CompanyRoleCapabilityOptions.map((role) => {
        const Icon = role.id === CompanyRoles.VIEWER ? EyeIcon : CheckIcon;
        return (
          <div key={role.id} className="rounded-xl border border-border bg-card p-5">
            <RoleBadge role={role.id} />
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {role.capabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    <div className="flex gap-2.5 rounded-lg bg-muted p-3 text-sm">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p>Permissions will become more fine-grained over time, so you are not limited to these four roles.</p>
    </div>
  </section>
);
