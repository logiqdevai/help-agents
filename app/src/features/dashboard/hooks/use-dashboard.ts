import { useQuery } from "@tanstack/react-query";
import type { DashboardQuery } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { getDashboard } from "@/features/dashboard/services/dashboard.services";

export const useGetDashboard = (query: DashboardQuery) =>
  useQuery({
    queryKey: ["dashboard", query],
    queryFn: () => getDashboard(query),
    refetchInterval: 60_000,
  });
