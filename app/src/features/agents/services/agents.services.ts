import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  Agent,
  AgentAccessList,
  AgentCrmTools,
  AgentGoalItem,
  AgentKnowledgeRef,
  AgentListItem,
  AgentOutcome,
  AgentOverview,
  AgentQuestion,
  AgentReadiness,
  AgentsQuery,
  CreateAgentDto,
  GoalItemInput,
  OutcomeInput,
  QuestionInput,
  RetryRule,
  SaveAgentBehaviorInput,
  UpdateAgentDto,
  UpsertRetryRuleDto,
} from "@/features/agents/interfaces/agents.interfaces";
import { cleanParams, type MessageResponse, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getAgents = async (query?: AgentsQuery): Promise<PaginatedResponse<AgentListItem>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch agents. Please try again."));
  }
};

export const getAgent = async (id: string): Promise<Agent> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the agent. Please try again."));
  }
};

export const getAgentOverview = async (id: string): Promise<AgentOverview> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.overview(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the agent overview. Please try again."));
  }
};

export const getAgentReadiness = async (id: string): Promise<AgentReadiness> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.readiness(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to check whether the agent is ready."));
  }
};

export const createAgent = async (dto: CreateAgentDto): Promise<Agent> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.agents.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create the agent."));
  }
};

export const updateAgent = async ({ id, dto }: { id: string; dto: UpdateAgentDto }): Promise<Agent> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.agents.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the agent."));
  }
};

export const deleteAgent = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.agents.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete the agent."));
  }
};

export const duplicateAgent = async (id: string): Promise<Agent> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.agents.duplicate(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not duplicate the agent."));
  }
};

export const activateAgent = async (id: string): Promise<Agent> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.agents.activate(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not activate the agent."));
  }
};

export const deactivateAgent = async (id: string): Promise<Agent> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.agents.deactivate(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not turn the agent off."));
  }
};

export const resyncAgent = async (id: string): Promise<{ is_ready: boolean }> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.agents.resync(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not prepare the agent again."));
  }
};

export const replaceAgentGoalItems = async (id: string, items: GoalItemInput[]): Promise<AgentGoalItem[]> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.goalItems(id), { items });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the goal."));
  }
};

export const replaceAgentQuestions = async (id: string, items: QuestionInput[]): Promise<AgentQuestion[]> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.questions(id), { items });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the questions."));
  }
};

export const replaceAgentOutcomes = async (id: string, items: OutcomeInput[]): Promise<AgentOutcome[]> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.outcomes(id), { items });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the outcomes."));
  }
};

export const replaceAgentTransferOutcomes = async (
  id: string,
  outcomeIds: string[],
): Promise<AgentOutcome[]> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.transferOutcomes(id), {
      outcome_uuids: outcomeIds,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save when to hand calls to a person."));
  }
};

/**
 * Saves everything on the Behavior step: the settings first, then each structured list.
 * The transfer outcomes go last because new outcomes only get their ids once they are saved.
 */
export const saveAgentBehavior = async ({
  agentId,
  settings,
  goalItems,
  questions,
  outcomes,
  transferOutcomePositions,
}: SaveAgentBehaviorInput): Promise<Agent> => {
  await updateAgent({ id: agentId, dto: settings });
  await replaceAgentGoalItems(agentId, goalItems);
  await replaceAgentQuestions(agentId, questions);
  const savedOutcomes = await replaceAgentOutcomes(agentId, outcomes);
  await replaceAgentTransferOutcomes(
    agentId,
    transferOutcomePositions.map((position) => savedOutcomes[position].id),
  );
  return getAgent(agentId);
};

export const replaceAgentKnowledgeSources = async (
  id: string,
  sourceIds: string[],
): Promise<AgentKnowledgeRef[]> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.knowledgeSources(id), {
      source_uuids: sourceIds,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the knowledge sources."));
  }
};

export const getAgentCrmTools = async (id: string): Promise<AgentCrmTools> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.crmTools(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the CRM actions."));
  }
};

export const replaceAgentCrmTools = async (id: string, toolIds: string[]): Promise<AgentCrmTools> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.crmTools(id), { crm_tool_uuids: toolIds });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the allowed CRM actions."));
  }
};

export const getAgentRetryRule = async (id: string): Promise<RetryRule> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.retryRule(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the retry rule."));
  }
};

export const upsertAgentRetryRule = async ({ id, dto }: { id: string; dto: UpsertRetryRuleDto }): Promise<RetryRule> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.retryRule(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the retry rule."));
  }
};

export const getAgentAccess = async (id: string): Promise<AgentAccessList> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.access(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch who can use this agent."));
  }
};

export const replaceAgentAccess = async ({
  id,
  memberIds,
}: {
  id: string;
  memberIds: string[];
}): Promise<AgentAccessList> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.agents.access(id), { member_uuids: memberIds });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save who can use this agent."));
  }
};
