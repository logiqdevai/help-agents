import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CallingHours,
  CreateScheduledCallDto,
  ScheduledCall,
  ScheduledCallCounts,
  ScheduledCallsQuery,
  UpdateScheduledCallDto,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import {
  cleanParams,
  type MessageResponse,
  type PaginatedResponse,
} from "@/interfaces/common.interfaces";

export const getScheduledCalls = async (
  query?: ScheduledCallsQuery,
): Promise<PaginatedResponse<ScheduledCall>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.scheduledCalls.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch scheduled calls. Please try again."));
  }
};

export const getScheduledCallCounts = async (): Promise<ScheduledCallCounts> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.scheduledCalls.counts);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the scheduled call totals."));
  }
};

export const createScheduledCall = async (dto: CreateScheduledCallDto): Promise<ScheduledCall> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.scheduledCalls.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not schedule the call."));
  }
};

export const updateScheduledCall = async ({
  id,
  dto,
}: {
  id: string;
  dto: UpdateScheduledCallDto;
}): Promise<ScheduledCall> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.scheduledCalls.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not reschedule the call."));
  }
};

export const cancelScheduledCall = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.scheduledCalls.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not cancel the scheduled call."));
  }
};

export const getCallingHours = async (): Promise<CallingHours> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.callingHours);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the calling hours."));
  }
};
