"use client";

import type { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsNavItems } from "@/config/constants/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

/** Sub-navigation shared by all settings pages. */
export const SettingsNav: FC = () => {
  const pathname = usePathname();
  const { can } = usePermissions();
  const items = SettingsNavItems.filter((item) => !item.permission || can(item.permission));

  return (
    <nav aria-label="Settings" className="flex gap-1 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex h-11 shrink-0 items-center px-3.5 text-[15px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              active &&
                "text-foreground after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};
