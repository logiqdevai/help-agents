import type { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AlertsListSkeleton: FC = () => (
  <div aria-busy="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex gap-4 border-b border-border px-6 py-5 last:border-b-0">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3.5 w-full max-w-lg" />
          <Skeleton className="h-3.5 w-64" />
          <Skeleton className="mt-1 h-7 w-40" />
        </div>
      </div>
    ))}
  </div>
);
