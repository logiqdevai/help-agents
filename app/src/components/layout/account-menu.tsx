"use client";

import Link from "next/link";
import { CheckIcon, ChevronUpIcon, LogOutIcon, ShieldCheckIcon, UserIcon, UsersIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

const MENU_CLASS =
  "min-w-[220px] rounded-xl border border-border bg-card p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.1)] ring-0";
const MENU_LABEL_CLASS = "px-3 pt-2 pb-1 text-xs font-semibold tracking-[0.96px] text-muted-foreground uppercase";
const MENU_ITEM_CLASS = "gap-2.5 rounded-lg px-3 py-[9px] text-sm tracking-normal text-ink";
const MENU_ICON_CLASS = "size-[18px]";
const MENU_SEPARATOR_CLASS = "mx-0 my-1.5";

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
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 gap-2.5 rounded-lg tracking-normal"
                tooltip={user?.name ?? "Account"}
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-gradient-lavender text-xs font-semibold tracking-normal text-ink">
                {initialsOf(user?.name ?? user?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col text-left leading-[1.3]">
              <span className="truncate text-sm font-medium text-ink">{user?.name ?? user?.email}</span>
              <span className="truncate text-xs text-muted-foreground">
                {activeCompany ? `${activeCompany.name} · ${getCompanyRoleLabel(activeCompany.role)}` : "—"}
              </span>
            </span>
            <ChevronUpIcon className="ml-auto size-[15px] text-body" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className={MENU_CLASS}>
            {companies.length > 1 ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className={MENU_LABEL_CLASS}>Company</DropdownMenuLabel>
                  {companies.map((company) => (
                    <DropdownMenuItem
                      key={company.id}
                      className={MENU_ITEM_CLASS}
                      onClick={() => switchCompany(company.id)}
                    >
                      <span className="flex-1 truncate">{company.name}</span>
                      {company.id === activeCompanyId ? <CheckIcon className={MENU_ICON_CLASS} /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
              </>
            ) : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel className={MENU_LABEL_CLASS}>Signed in as</DropdownMenuLabel>
              <DropdownMenuItem className={MENU_ITEM_CLASS} render={<Link href={Routes.settings.account} />}>
                <UserIcon className={MENU_ICON_CLASS} /> Account
              </DropdownMenuItem>
              <DropdownMenuItem className={MENU_ITEM_CLASS} render={<Link href={Routes.settings.security} />}>
                <ShieldCheckIcon className={MENU_ICON_CLASS} /> Security
              </DropdownMenuItem>
              <DropdownMenuItem className={MENU_ITEM_CLASS} render={<Link href={Routes.settings.team} />}>
                <UsersIcon className={MENU_ICON_CLASS} /> Team
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
            <DropdownMenuItem
              variant="destructive"
              className={cn(MENU_ITEM_CLASS, "data-[variant=destructive]:focus:bg-accent")}
              onClick={() => logout.mutate()}
            >
              <LogOutIcon className={MENU_ICON_CLASS} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
