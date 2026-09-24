import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  AgentFilterOption,
  UsageQuery,
  UsageReport,
  UsageTimeseries,
  UsageTimeseriesQuery,
} from "@/features/analytics/interfaces/analytics.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getUsageReport = async (query: UsageQuery): Promise<UsageReport> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.analytics.usage, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the usage report. Please try again."));
  }
};

export const getUsageTimeseries = async (query: UsageTimeseriesQuery): Promise<UsageTimeseries> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.analytics.timeseries, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load usage over time. Please try again."));
  }
};

/** Agents the caller can see, for the "All agents" filter. */
export const getAgentFilterOptions = async (): Promise<AgentFilterOption[]> => {
  try {
    const response = await axiosInstance.get<PaginatedResponse<AgentFilterOption>>(ApiRoutes.agents.root, {
      params: { limit: 100, order_by: "name", order_direction: "asc" },
    });
    return response.data.data.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load agents."));
  }
};
