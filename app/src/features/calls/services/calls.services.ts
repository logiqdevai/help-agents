import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CallAgentOption,
  CallDetail,
  CallFilterOptions,
  CallListItem,
  CallRecordingUrl,
  CallsQuery,
  CrmAction,
  PlaceCallDto,
} from "@/features/calls/interfaces/calls.interfaces";
import {
  cleanParams,
  type MessageResponse,
  type PaginatedResponse,
} from "@/interfaces/common.interfaces";

export const getCalls = async (query?: CallsQuery): Promise<PaginatedResponse<CallListItem>> => {
  try {
    // `is_test=all` is a real value here (the API hides test calls by default), so it must not be dropped.
    const response = await axiosInstance.get(ApiRoutes.calls.root, {
      params: { ...cleanParams(query), is_test: query?.is_test },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch calls. Please try again."));
  }
};

export const getCallFilterOptions = async (): Promise<CallFilterOptions> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.calls.filterStats);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the call filters."));
  }
};

export const getCall = async (id: string): Promise<CallDetail> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.calls.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the call."));
  }
};

export const getCallRecording = async (id: string): Promise<CallRecordingUrl> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.calls.recording(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "The recording is not available."));
  }
};

export const retryCallAction = async ({
  callId,
  actionId,
}: {
  callId: string;
  actionId: string;
}): Promise<Pick<CrmAction, "id" | "status" | "error">> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.calls.retryAction(callId, actionId));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not retry the CRM update."));
  }
};

export const stopCall = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.calls.stop(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not stop the call."));
  }
};

export const placeTestCall = async (dto: PlaceCallDto): Promise<CallListItem> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.calls.test, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not start the test call."));
  }
};

export const placeCall = async (dto: PlaceCallDto): Promise<CallListItem> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.calls.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not start the call."));
  }
};

/** Agents to pick from when placing or scheduling a call. */
export const getCallAgentOptions = async (activeOnly: boolean): Promise<CallAgentOption[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.root, {
      params: { limit: 100, order_by: "name", order_direction: "asc", ...(activeOnly && { status: "ACTIVE" }) },
    });
    return (response.data.data as CallAgentOption[]).map(({ id, name }) => ({ id, name }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load your agents."));
  }
};
