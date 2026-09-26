import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** DESIGN.MD: content caps at 1200px. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)} {...props} />;
}
