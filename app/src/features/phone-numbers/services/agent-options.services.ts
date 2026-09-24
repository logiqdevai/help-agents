import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { AgentOption } from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import type { PaginatedResponse } from "@/interfaces/common.interfaces";

/** Runtime `{ id, name }` picker data for screens that let the user choose an agent. */
export const getAgentOptions = async (): Promise<AgentOption[]> => {
  try {
    const response = await axiosInstance.get<PaginatedResponse<AgentOption>>(ApiRoutes.agents.root, {
      params: { limit: 100, order_by: "name", order_direction: "asc" },
    });
    return response.data.data.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch agents. Please try again."));
  }
};
