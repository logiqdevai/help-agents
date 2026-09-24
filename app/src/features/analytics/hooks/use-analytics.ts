import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UsageQuery, UsageTimeseriesQuery } from "@/features/analytics/interfaces/analytics.interfaces";
import {
  getAgentFilterOptions,
  getUsageReport,
  getUsageTimeseries,
} from "@/features/analytics/services/analytics.services";

export const useGetUsageReport = (query: UsageQuery, enabled = true) =>
  useQuery({
    queryKey: ["analytics-usage", query],
    queryFn: () => getUsageReport(query),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useGetUsageTimeseries = (query: UsageTimeseriesQuery, enabled = true) =>
  useQuery({
    queryKey: ["analytics-timeseries", query],
    queryFn: () => getUsageTimeseries(query),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useGetAgentFilterOptions = () =>
  useQuery({
    queryKey: ["analytics-agent-options"],
    queryFn: getAgentFilterOptions,
    staleTime: 60_000,
  });
