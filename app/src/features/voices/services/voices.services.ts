import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { Voice, VoicesQuery } from "@/features/voices/interfaces/voices.interfaces";
import { cleanParams } from "@/interfaces/common.interfaces";

export const getVoices = async (query?: VoicesQuery): Promise<Voice[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.voices, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch voices. Please try again."));
  }
};
