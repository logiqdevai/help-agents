import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  ActivityActorOption,
  ActivityLogEntry,
  ActivityLogQuery,
} from "@/features/activity-log/interfaces/activity-log.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getActivityLog = async (query?: ActivityLogQuery): Promise<PaginatedResponse<ActivityLogEntry>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.activityLog, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the activity log. Please try again."));
  }
};

interface MemberRow {
  user: { id: string; name: string | null; email: string };
}

/** Team members, for the "Who" filter. */
export const getActivityActors = async (): Promise<ActivityActorOption[]> => {
  try {
    const response = await axiosInstance.get<PaginatedResponse<MemberRow>>(ApiRoutes.company.members, {
      params: { limit: 100 },
    });
    return response.data.data.map(({ user }) => ({ id: user.id, name: user.name ?? user.email }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load team members."));
  }
};
