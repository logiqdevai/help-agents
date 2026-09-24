import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ActivityLogQuery } from "@/features/activity-log/interfaces/activity-log.interfaces";
import { getActivityActors, getActivityLog } from "@/features/activity-log/services/activity-log.services";

export const useGetActivityLog = (query: ActivityLogQuery, enabled = true) =>
  useQuery({
    queryKey: ["activity-log", query],
    queryFn: () => getActivityLog(query),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useGetActivityActors = (enabled = true) =>
  useQuery({
    queryKey: ["activity-actors"],
    queryFn: getActivityActors,
    staleTime: 60_000,
    enabled,
  });
