import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { CrmRecordType } from "@/features/contacts/interfaces/contacts.interfaces";
import type {
  CrmField,
  FieldMappingsResponse,
  InternalFieldsResponse,
  ReplaceFieldMappingsDto,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const getInternalCrmFields = async (): Promise<InternalFieldsResponse> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.internalFields);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the platform fields."));
  }
};

export const getCrmFields = async ({
  integrationId,
  recordType,
}: {
  integrationId: string;
  recordType: CrmRecordType;
}): Promise<CrmField[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.crmFields(integrationId), {
      params: { record_type: recordType },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not read the fields of your CRM."));
  }
};

export const getFieldMappings = async ({
  integrationId,
  agentUuid,
}: {
  integrationId: string;
  agentUuid?: string;
}): Promise<FieldMappingsResponse> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.fieldMappings(integrationId), {
      params: agentUuid ? { agent_uuid: agentUuid } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the field mapping."));
  }
};

export const replaceFieldMappings = async ({
  integrationId,
  dto,
}: {
  integrationId: string;
  dto: ReplaceFieldMappingsDto;
}): Promise<FieldMappingsResponse> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.integrations.fieldMappings(integrationId), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the field mapping."));
  }
};
