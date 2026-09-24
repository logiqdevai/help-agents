import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  Alert,
  AlertsQuery,
  AlertsSummary,
  DismissAllAlertsDto,
  DismissAllAlertsResult,
  RetryCrmUpdateDto,
} from "@/features/alerts/interfaces/alerts.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getAlerts = async (query?: AlertsQuery): Promise<PaginatedResponse<Alert>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.alerts.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load alerts. Please try again."));
  }
};

export const getAlertsSummary = async (): Promise<AlertsSummary> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.alerts.summary);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the alert summary."));
  }
};

export const resolveAlert = async (id: string): Promise<Alert> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.alerts.resolve(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to resolve the alert."));
  }
};

export const dismissAlert = async (id: string): Promise<Alert> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.alerts.dismiss(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to dismiss the alert."));
  }
};

export const dismissAllAlerts = async (dto: DismissAllAlertsDto): Promise<DismissAllAlertsResult> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.alerts.dismissAll, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to dismiss the alerts."));
  }
};

export const retryCrmUpdate = async ({ callId, actionId }: RetryCrmUpdateDto): Promise<void> => {
  try {
    await axiosInstance.post(ApiRoutes.calls.retryAction(callId, actionId));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to retry the CRM update."));
  }
};
