"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { AlertsBell } from "@/components/layout/alerts-bell";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_NAME } from "@/config/constants/app";
import { getNavTitle } from "@/config/constants/navigation";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

export function AppBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="font-display text-2xl font-light tracking-tight">
        {getNavTitle(pathname) ?? APP_NAME}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <AlertsBell />
        <Link
          href={Routes.agents.create}
          className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 text-[15px]")}
        >
          <Plus />
          Create agent
        </Link>
      </div>
    </header>
  );
}
