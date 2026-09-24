import type { FC } from "react";
import { DashboardKpisSkeleton } from "@/views/dashboard/components/dashboard-kpis";
import { Skeleton } from "@/components/ui/skeleton";

/** Layout-shaped placeholder for everything below the dashboard header. */
export const DashboardSkeleton: FC = () => (
  <div aria-busy="true" className="flex flex-col gap-6">
    <DashboardKpisSkeleton />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Skeleton className="h-80 rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
    <Skeleton className="h-80 rounded-xl" />
  </div>
);
