"use client";

import type { FC } from "react";
import Link from "next/link";
import { Building2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import { useGetMyCompanies } from "@/features/company/hooks/use-company";
import { useSwitchCompany } from "@/features/company/hooks/use-switch-company";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { SettingsCard } from "../../components/settings-card";

export const CompaniesCard: FC = () => {
  const companies = useGetMyCompanies();
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const switchCompany = useSwitchCompany();

  return (
    <SettingsCard title="Companies" description="Companies you are a member of." flush>
      {companies.isPending ? (
        <div className="flex flex-col gap-3 px-5 py-4 md:px-6" aria-busy="true">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : null}
      {companies.isError ? (
        <div className="p-5">
          <ErrorState
            title="Could not load your companies"
            message={companies.error.message}
            onRetry={() => companies.refetch()}
          />
        </div>
      ) : null}
      {companies.data ? (
        <ul className="divide-y divide-border">
          {companies.data.map((company) => {
            const isCurrent = company.id === activeCompanyId;
            return (
              <li key={company.id} className="flex flex-wrap items-center gap-3.5 px-5 py-4 md:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-mint/50">
                  <Building2Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="truncate">{company.name}</span>
                    {isCurrent ? <StatusBadge tone={StatusTones.INFO}>Current</StatusBadge> : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getDropdownOptionLabel(CompanyRoleFormOptions, company.role)} · {company.timezone} ·{" "}
                    {company.member_count} {company.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
                {isCurrent ? (
                  <Link
                    href={Routes.settings.organization}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Open settings
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => switchCompany(company.id)}>
                    Switch to this company
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </SettingsCard>
  );
};
