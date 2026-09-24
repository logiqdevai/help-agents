"use client";

import Link from "next/link";
import { CheckIcon, ChevronsUpDownIcon, LogOutIcon, ShieldCheckIcon, UserIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { getCompanyRoleLabel } from "@/config/constants/dropdowns/users/company-role-form.options";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useSwitchCompany } from "@/features/company/hooks/use-switch-company";
import { initialsOf } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

/** Sidebar footer: who is signed in, company switcher, account links and log out. */
export function AccountMenu() {
  const user = useAuthStore((state) => state.user);
  const companies = useAuthStore((state) => state.companies);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const switchCompany = useSwitchCompany();
  const logout = useLogout();

  const activeCompany = companies.find((company) => company.id === activeCompanyId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="h-12" tooltip={user?.name ?? "Account"} />}
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-gradient-lavender/60 text-xs font-medium">
                {initialsOf(user?.name ?? user?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
              <span className="truncate text-sm font-medium">{user?.name ?? user?.email}</span>
              <span className="truncate text-xs text-muted-foreground">
                {activeCompany ? `${activeCompany.name} · ${getCompanyRoleLabel(activeCompany.role)}` : "—"}
              </span>
            </span>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-60">
            {companies.length > 1 ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Company</DropdownMenuLabel>
                  {companies.map((company) => (
                    <DropdownMenuItem key={company.id} onClick={() => switchCompany(company.id)}>
                      <span className="flex-1 truncate">{company.name}</span>
                      {company.id === activeCompanyId ? <CheckIcon className="size-4" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={Routes.settings.account} />}>
                <UserIcon /> Account
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={Routes.settings.security} />}>
                <ShieldCheckIcon /> Security
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={Routes.settings.team} />}>
                <UsersIcon /> Team
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()}>
              <LogOutIcon /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
