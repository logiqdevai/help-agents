"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_NAME } from "@/config/constants/app";
import {
  isNavItemActive,
  PrimaryNavItems,
  SecondaryNavItems,
  type NavItem,
} from "@/config/constants/navigation";
import { AccountMenu } from "@/components/layout/account-menu";
import { Routes } from "@/routes/routes";

function NavMenu({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            render={<Link href={item.href} />}
            isActive={isNavItemActive(item.href, pathname)}
            tooltip={item.title}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
        <Link href={Routes.home} className="flex items-center gap-2.5">
          {/* Atmospheric gradient orb — DESIGN.MD's signature brand decoration. */}
          <span
            aria-hidden
            className="size-7 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-gradient-mint),var(--color-gradient-lavender)_60%,var(--color-gradient-peach))]"
          />
          <span className="font-display text-xl font-light tracking-tight group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavMenu items={PrimaryNavItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavMenu items={SecondaryNavItems} pathname={pathname} />
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
