import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { DashboardQuery, DashboardResponse } from "@/features/dashboard/interfaces/dashboard.interfaces";

export const getDashboard = async (query: DashboardQuery): Promise<DashboardResponse> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.dashboard, { params: query });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the dashboard. Please try again."));
  }
};
