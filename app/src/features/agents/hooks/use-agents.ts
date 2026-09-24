import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, AgentsQuery } from "@/features/agents/interfaces/agents.interfaces";
import {
  activateAgent,
  createAgent,
  deactivateAgent,
  deleteAgent,
  duplicateAgent,
  getAgent,
  getAgentAccess,
  getAgentCrmTools,
  getAgentOverview,
  getAgentReadiness,
  getAgentRetryRule,
  getAgents,
  replaceAgentAccess,
  replaceAgentCrmTools,
  replaceAgentKnowledgeSources,
  resyncAgent,
  saveAgentBehavior,
  updateAgent,
  upsertAgentRetryRule,
} from "@/features/agents/services/agents.services";
import { notify } from "@/lib/notify";

// Every per-agent query key starts with ["agent", id], so one invalidation of ["agent"] refreshes
// the configuration, overview, readiness and CRM actions together; lists live under ["agents"].
const AGENT_KEY = "agent";
const AGENTS_KEY = "agents";

export const useGetAgents = (query?: AgentsQuery) =>
  useQuery({
    queryKey: [AGENTS_KEY, query],
    queryFn: () => getAgents(query),
    placeholderData: keepPreviousData,
  });

export const useGetAgent = (id: string) =>
  useQuery({
    queryKey: [AGENT_KEY, id],
    queryFn: () => getAgent(id),
    enabled: !!id,
  });

export const useGetAgentOverview = (id: string) =>
  useQuery({
    queryKey: [AGENT_KEY, id, "overview"],
    queryFn: () => getAgentOverview(id),
    enabled: !!id,
  });

/** Always re-checked on mount: the setup steps can change on other screens (phone numbers, knowledge). */
export const useGetAgentReadiness = (id: string) =>
  useQuery({
    queryKey: [AGENT_KEY, id, "readiness"],
    queryFn: () => getAgentReadiness(id),
    enabled: !!id,
    staleTime: 0,
  });

export const useGetAgentCrmTools = (id: string, enabled = true) =>
  useQuery({
    queryKey: [AGENT_KEY, id, "crm-tools"],
    queryFn: () => getAgentCrmTools(id),
    enabled: enabled && !!id,
  });

export const useGetAgentRetryRule = (id: string, enabled = true) =>
  useQuery({
    queryKey: [AGENT_KEY, id, "retry-rule"],
    queryFn: () => getAgentRetryRule(id),
    enabled: enabled && !!id,
  });

export const useGetAgentAccess = (id: string, enabled = true) =>
  useQuery({
    queryKey: [AGENT_KEY, id, "access"],
    queryFn: () => getAgentAccess(id),
    enabled: enabled && !!id,
  });

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (agent) => {
      queryClient.setQueryData([AGENT_KEY, agent.id], agent);
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      notify.success("Draft saved", "You can pick this up again from the agents list.");
    },
    onError: (error) => notify.error("Could not create the agent", error.message),
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgent,
    onSuccess: (agent) => {
      queryClient.setQueryData([AGENT_KEY, agent.id], agent);
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Agent saved");
    },
    onError: (error) => notify.error("Could not save the agent", error.message),
  });
};

export const useSaveAgentBehavior = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAgentBehavior,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Behavior saved");
    },
    onError: (error) => notify.error("Could not save the behavior", error.message),
  });
};

export const useReplaceAgentKnowledgeSources = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sourceIds }: { id: string; sourceIds: string[] }) =>
      replaceAgentKnowledgeSources(id, sourceIds),
    onSuccess: (sources, { id }) => {
      queryClient.setQueryData<Agent>([AGENT_KEY, id], (agent) =>
        agent ? { ...agent, knowledge_sources: sources } : agent,
      );
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      notify.success("Knowledge saved");
    },
    onError: (error) => notify.error("Could not save the knowledge", error.message),
  });
};

export const useReplaceAgentCrmTools = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toolIds }: { id: string; toolIds: string[] }) => replaceAgentCrmTools(id, toolIds),
    onSuccess: (tools, { id }) => {
      queryClient.setQueryData([AGENT_KEY, id, "crm-tools"], tools);
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Allowed CRM actions saved");
    },
    onError: (error) => notify.error("Could not save the allowed CRM actions", error.message),
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      notify.success("Agent deleted", "Its past calls stay in your call history.");
    },
    onError: (error) => notify.error("Could not delete the agent", error.message),
  });
};

export const useDuplicateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      notify.success("Agent duplicated", `${agent.name} was added as a draft.`);
    },
    onError: (error) => notify.error("Could not duplicate the agent", error.message),
  });
};

export const useActivateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Agent is live", `${agent.name} can now make and receive calls.`);
    },
    onError: (error) => notify.error("Could not activate the agent", error.message),
  });
};

export const useDeactivateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Agent turned off", `${agent.name} no longer makes or receives calls.`);
    },
    onError: (error) => notify.error("Could not turn the agent off", error.message),
  });
};

export const useResyncAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resyncAgent,
    onSuccess: ({ is_ready }) => {
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      if (is_ready) notify.success("Agent is up to date");
      else notify.warning("The agent could not be prepared yet", "The service is unavailable. Try again shortly.");
    },
    onError: (error) => notify.error("Could not prepare the agent", error.message),
  });
};

export const useUpsertAgentRetryRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertAgentRetryRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      notify.success("Retry rule saved");
    },
    onError: (error) => notify.error("Could not save the retry rule", error.message),
  });
};

export const useReplaceAgentAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replaceAgentAccess,
    onSuccess: (access, { id }) => {
      queryClient.setQueryData([AGENT_KEY, id, "access"], access);
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      notify.success("Access saved");
    },
    onError: (error) => notify.error("Could not save who can use this agent", error.message),
  });
};
