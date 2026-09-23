import {
  BarChart3,
  BookOpen,
  Bot,
  LayoutDashboard,
  Phone,
  PhoneCall,
  Plug,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Campaigns is intentionally absent: it is a Version 2 feature (docs/Product_Specification.md §37).
export const PrimaryNavItems: NavItem[] = [
  { title: "Dashboard", href: Routes.home, icon: LayoutDashboard },
  { title: "Agents", href: Routes.agents.root, icon: Bot },
  { title: "Calls", href: Routes.calls, icon: PhoneCall },
  { title: "Knowledge", href: Routes.knowledge, icon: BookOpen },
  { title: "Integrations", href: Routes.integrations, icon: Plug },
  { title: "Phone Numbers", href: Routes.phoneNumbers, icon: Phone },
  { title: "Analytics", href: Routes.analytics, icon: BarChart3 },
];

export const SecondaryNavItems: NavItem[] = [
  { title: "Settings", href: Routes.settings, icon: Settings },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  return href === Routes.home
    ? pathname === Routes.home
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavTitle(pathname: string): string | undefined {
  return [...PrimaryNavItems, ...SecondaryNavItems].find((item) =>
    isNavItemActive(item.href, pathname),
  )?.title;
}
