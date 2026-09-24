import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CreateIntegrationDto,
  Integration,
  IntegrationAgent,
  IntegrationsQuery,
  OAuthStartDto,
  OAuthStartResult,
  ProviderInfo,
  TestConnectionResult,
  UpdateIntegrationDto,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getIntegrations = async (query?: IntegrationsQuery): Promise<PaginatedResponse<Integration>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch integrations. Please try again."));
  }
};

export const getIntegration = async (id: string): Promise<Integration> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the integration."));
  }
};

export const getIntegrationProviders = async (): Promise<ProviderInfo[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.providers);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the available apps."));
  }
};

export const getIntegrationAgents = async (id: string): Promise<IntegrationAgent[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.agents(id));
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the agents using this connection."));
  }
};

export const createIntegration = async (dto: CreateIntegrationDto): Promise<Integration> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.integrations.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the connection."));
  }
};

export const updateIntegration = async ({
  id,
  dto,
}: {
  id: string;
  dto: UpdateIntegrationDto;
}): Promise<Integration> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.integrations.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the connection."));
  }
};

export const deleteIntegration = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(ApiRoutes.integrations.detail(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not disconnect the integration."));
  }
};

export const testIntegration = async (id: string): Promise<TestConnectionResult> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.integrations.test(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not test the connection."));
  }
};

export const startIntegrationOAuth = async ({
  provider,
  dto,
}: {
  provider: string;
  dto: OAuthStartDto;
}): Promise<OAuthStartResult> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.integrations.oauthStart(provider.toLowerCase()), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not start the sign-in."));
  }
};
