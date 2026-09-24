import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  ImportPhoneNumberDto,
  PhoneNumber,
  PhoneNumbersQuery,
  ProvisionPhoneNumberInput,
  ProvisionPhoneNumberResult,
  UpdatePhoneNumberDto,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getPhoneNumbers = async (query?: PhoneNumbersQuery): Promise<PaginatedResponse<PhoneNumber>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.phoneNumbers.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch phone numbers. Please try again."));
  }
};

export const assignPhoneNumberAgent = async ({
  id,
  agent_uuid,
}: {
  id: string;
  agent_uuid: string | null;
}): Promise<PhoneNumber> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.phoneNumbers.agent(id), { agent_uuid });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the agent for this number."));
  }
};

export const provisionPhoneNumber = async ({
  dto,
  agent_uuid,
}: ProvisionPhoneNumberInput): Promise<ProvisionPhoneNumberResult> => {
  let phone: PhoneNumber;
  try {
    phone = (await axiosInstance.post(ApiRoutes.phoneNumbers.provision, dto)).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not get a new phone number."));
  }
  if (!agent_uuid) return { phone, agentError: null };

  try {
    return { phone: await assignPhoneNumberAgent({ id: phone.id, agent_uuid }), agentError: null };
  } catch (error) {
    return { phone, agentError: error instanceof Error ? error.message : "The agent could not be assigned." };
  }
};

export const importPhoneNumber = async (dto: ImportPhoneNumberDto): Promise<PhoneNumber> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.phoneNumbers.import, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not connect that phone number."));
  }
};

export const updatePhoneNumber = async ({
  id,
  dto,
}: {
  id: string;
  dto: UpdatePhoneNumberDto;
}): Promise<PhoneNumber> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.phoneNumbers.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the phone number."));
  }
};

export const releasePhoneNumber = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(ApiRoutes.phoneNumbers.detail(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not release the phone number."));
  }
};
