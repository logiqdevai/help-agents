"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { useAuthHydrated } from "@/components/providers/auth-guard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LandingNavLinks } from "@/config/constants/landing";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

const ctaClass = "h-10 px-5 text-[15px]";

function HeaderActions({ signedIn, onNavigate }: { signedIn: boolean; onNavigate?: () => void }) {
  if (signedIn) {
    return (
      <Link href={Routes.dashboard} onClick={onNavigate} className={cn(buttonVariants(), ctaClass)}>
        Open dashboard
      </Link>
    );
  }
  return (
    <>
      <Link
        href={Routes.auth.login}
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: "ghost" }), ctaClass)}
      >
        Log in
      </Link>
      <Link href={Routes.marketing.contact} onClick={onNavigate} className={cn(buttonVariants(), ctaClass)}>
        Book a demo
      </Link>
    </>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  // Server render and first paint always show the signed-out actions.
  const signedIn = hydrated && Boolean(accessToken);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-8 px-5 sm:px-8">
        <BrandMark />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LandingNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-[15px] font-medium text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <HeaderActions signedIn={signedIn} />
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-lg" className="ml-auto md:hidden" aria-label="Open menu" />}
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="gap-0 bg-canvas p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 items-center border-b border-hairline px-5">
              <BrandMark />
            </div>
            <nav aria-label="Mobile" className="flex flex-col px-3 py-4">
              {LandingNavLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-3 font-display text-2xl font-light text-ink transition-colors hover:bg-surface-strong"
                    />
                  }
                >
                  {link.title}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-hairline p-5">
              <HeaderActions signedIn={signedIn} onNavigate={() => setMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
