import Link from "next/link";
import { APP_NAME } from "@/config/constants/app";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

/** Gradient-orb logomark + wordmark, linking to the marketing home page. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href={Routes.home} className={cn("flex items-center gap-2.5 rounded-full", className)}>
      <span
        aria-hidden
        className="size-7 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-gradient-mint),var(--color-gradient-lavender)_60%,var(--color-gradient-peach))]"
      />
      <span className="font-display text-[22px] font-light tracking-[-0.2px] text-ink">{APP_NAME}</span>
    </Link>
  );
}
