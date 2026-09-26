import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { CreateContactRequestDto } from "@/features/contact/interfaces/contact.interfaces";
import type { MessageResponse } from "@/interfaces/common.interfaces";

export const sendContactRequest = async (dto: CreateContactRequestDto): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.contact, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not send your request. Please try again."));
  }
};
