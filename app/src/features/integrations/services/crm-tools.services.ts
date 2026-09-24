import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CreateCrmToolDto,
  CrmTool,
  CrmToolsQuery,
  UpdateCrmToolDto,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const getIntegrationCrmTools = async (
  integrationId: string,
  query?: CrmToolsQuery,
): Promise<CrmTool[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.crmTools(integrationId), { params: query });
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the tools of this connection."));
  }
};

export const createCrmTool = async ({
  integrationId,
  dto,
}: {
  integrationId: string;
  dto: CreateCrmToolDto;
}): Promise<CrmTool> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.integrations.crmTools(integrationId), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not add the tool."));
  }
};

export const updateCrmTool = async ({
  integrationId,
  toolId,
  dto,
}: {
  integrationId: string;
  toolId: string;
  dto: UpdateCrmToolDto;
}): Promise<CrmTool> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.integrations.crmTool(integrationId, toolId), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the tool."));
  }
};

export const deleteCrmTool = async ({
  integrationId,
  toolId,
}: {
  integrationId: string;
  toolId: string;
}): Promise<void> => {
  try {
    await axiosInstance.delete(ApiRoutes.integrations.crmTool(integrationId, toolId));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete the tool."));
  }
};
