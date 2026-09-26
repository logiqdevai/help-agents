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
import { useGetAgents } from "@/features/agents/hooks/use-agents";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

interface NavMenuProps {
  items: NavItem[];
  pathname: string;
  counts?: Record<string, number | undefined>;
  className?: string;
}

function NavMenu({ items, pathname, counts, className }: NavMenuProps) {
  return (
    <SidebarMenu className={cn("gap-0.5", className)}>
      {items.map((item) => {
        const count = counts?.[item.href];
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={isNavItemActive(item.href, pathname)}
              tooltip={item.title}
              className="h-10 gap-3 rounded-lg px-3 text-[15px] font-medium tracking-normal text-body [&_svg]:size-[18px] [&_svg]:stroke-[1.75]"
            >
              <item.icon />
              <span>{item.title}</span>
              {count !== undefined ? (
                <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-px text-[13px] leading-[1.4] font-medium tracking-normal text-ink group-data-[collapsible=icon]:hidden">
                  {count}
                </span>
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const agents = useGetAgents({ limit: 1 });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-5 py-0 group-data-[collapsible=icon]:px-2.5">
        <Link href={Routes.home} className="flex items-center gap-2.5">
          {/* Atmospheric gradient orb — DESIGN.MD's signature brand decoration. */}
          <span
            aria-hidden
            className="size-7 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-gradient-mint),var(--color-gradient-lavender)_60%,var(--color-gradient-peach))]"
          />
          <span className="font-display text-[22px] font-light tracking-[-0.2px] text-ink group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-4 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <NavMenu
              items={PrimaryNavItems}
              pathname={pathname}
              counts={{ [Routes.agents.root]: agents.data?.pagination.total }}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-0.5 border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-2">
        <NavMenu items={SecondaryNavItems} pathname={pathname} className="pb-2" />
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
