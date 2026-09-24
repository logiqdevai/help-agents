import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  AutomationRule,
  AutomationRulesQuery,
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import { cleanParams, type MessageResponse, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getAutomationRules = async (
  query?: AutomationRulesQuery,
): Promise<PaginatedResponse<AutomationRule>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.automationRules.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch automation rules. Please try again."));
  }
};

export const createAutomationRule = async (dto: CreateAutomationRuleDto): Promise<AutomationRule> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.automationRules.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create the rule."));
  }
};

export const updateAutomationRule = async ({
  id,
  dto,
}: {
  id: string;
  dto: UpdateAutomationRuleDto;
}): Promise<AutomationRule> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.automationRules.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the rule."));
  }
};

export const setAutomationRuleEnabled = async ({
  id,
  isEnabled,
}: {
  id: string;
  isEnabled: boolean;
}): Promise<AutomationRule> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.automationRules.enabled(id), { is_enabled: isEnabled });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not change the rule."));
  }
};

export const deleteAutomationRule = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.automationRules.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete the rule."));
  }
};
