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
import { Permissions, type Permission } from "@/config/constants/permissions";
import { Routes } from "@/routes/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Campaigns is intentionally absent: it is a Version 2 feature (docs/Product_Specification.md §37).
export const PrimaryNavItems: NavItem[] = [
  { title: "Dashboard", href: Routes.dashboard, icon: LayoutDashboard },
  { title: "Agents", href: Routes.agents.root, icon: Bot },
  { title: "Calls", href: Routes.calls.root, icon: PhoneCall },
  { title: "Knowledge", href: Routes.knowledge.root, icon: BookOpen },
  { title: "Integrations", href: Routes.integrations.root, icon: Plug },
  { title: "Phone Numbers", href: Routes.phoneNumbers, icon: Phone },
  { title: "Analytics", href: Routes.analytics, icon: BarChart3 },
];

export const SecondaryNavItems: NavItem[] = [
  { title: "Settings", href: Routes.settings.root, icon: Settings },
];

// Pages that belong to a nav section but live under a different URL prefix.
const ExtraTitles: { prefix: string; title: string }[] = [
  { prefix: Routes.alerts, title: "Alerts" },
  { prefix: Routes.activityLog, title: "Activity log" },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavTitle(pathname: string): string | undefined {
  const extra = ExtraTitles.find((item) => isNavItemActive(item.prefix, pathname));
  if (extra) return extra.title;
  return [...PrimaryNavItems, ...SecondaryNavItems].find((item) =>
    isNavItemActive(item.href, pathname),
  )?.title;
}

export interface SettingsNavItem {
  title: string;
  href: string;
  /** Hidden from roles that lack this permission. */
  permission?: Permission;
}

// Sub-navigation shared by every settings page (views/settings/components/settings-nav.tsx).
export const SettingsNavItems: SettingsNavItem[] = [
  { title: "Organization", href: Routes.settings.organization },
  { title: "Team", href: Routes.settings.team },
  { title: "Security", href: Routes.settings.security },
  { title: "Account", href: Routes.settings.account },
  { title: "Activity log", href: Routes.activityLog, permission: Permissions.ACTIVITY_READ },
];
