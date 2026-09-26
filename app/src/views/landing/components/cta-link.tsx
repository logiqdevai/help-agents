import type { ComponentProps } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: "primary" | "outline";
  className?: string;
}

/** DESIGN.MD button: 40px ink pill (primary) or hairline outline pill (secondary). */
export function CtaLink({ variant = "primary", className, ...props }: CtaLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({ variant: variant === "primary" ? "default" : "outline" }),
        "h-10 px-5 text-[15px]",
        className,
      )}
      {...props}
    />
  );
}
