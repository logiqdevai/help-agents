import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KnowledgeStatuses,
  type KnowledgeQuery,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import {
  createKnowledge,
  createKnowledgeVersion,
  deleteKnowledge,
  getKnowledgeSource,
  getKnowledgeSources,
  getKnowledgeStats,
  getKnowledgeVersion,
  refreshKnowledge,
  replaceKnowledgeAgents,
  restoreKnowledgeVersion,
  updateKnowledge,
  uploadKnowledge,
} from "@/features/knowledge/services/knowledge.services";
import { notify } from "@/lib/notify";

// Every knowledge query key starts with "knowledge", so one invalidation refreshes lists, detail, stats and versions.
const KNOWLEDGE_KEY = "knowledge";
// Sources are processed in the background; poll while any of them is still being prepared.
const PROCESSING_POLL_MS = 3000;

export const useGetKnowledgeSources = (query?: KnowledgeQuery) =>
  useQuery({
    queryKey: [KNOWLEDGE_KEY, "list", query],
    queryFn: () => getKnowledgeSources(query),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.data.some((source) => source.status === KnowledgeStatuses.PROCESSING)
        ? PROCESSING_POLL_MS
        : false,
  });

export const useGetKnowledgeStats = () =>
  useQuery({
    queryKey: [KNOWLEDGE_KEY, "stats"],
    queryFn: getKnowledgeStats,
    refetchInterval: (query) => (query.state.data?.processing ? PROCESSING_POLL_MS : false),
  });

export const useGetKnowledgeSource = (id: string) =>
  useQuery({
    queryKey: [KNOWLEDGE_KEY, "detail", id],
    queryFn: () => getKnowledgeSource(id),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === KnowledgeStatuses.PROCESSING ? PROCESSING_POLL_MS : false,
  });

export const useGetKnowledgeVersion = (id: string, version: number | null) =>
  useQuery({
    queryKey: [KNOWLEDGE_KEY, "version", id, version],
    queryFn: () => getKnowledgeVersion(id, version as number),
    enabled: !!id && version !== null,
  });

export const useCreateKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledge,
    onSuccess: ({ agentsError }) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (agentsError) {
        notify.warning("Knowledge saved, but agents were not updated", agentsError);
      } else {
        notify.success("Knowledge saved", "Processing has started.");
      }
    },
    onError: (error) => notify.error("Could not save knowledge", error.message),
  });
};

export const useUploadKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadKnowledge,
    onSuccess: ({ sources, failures, agentsError }) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (failures.length) {
        notify.warning(
          `${sources.length} of ${sources.length + failures.length} files uploaded`,
          `${failures[0].filename}: ${failures[0].message}`,
        );
      } else if (agentsError) {
        notify.warning("Files uploaded, but agents were not updated", agentsError);
      } else {
        notify.success(sources.length === 1 ? "File uploaded" : "Files uploaded", "Processing has started.");
      }
    },
    onError: (error) => notify.error("Could not upload the file", error.message),
  });
};

export const useUpdateKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateKnowledge,
    onSuccess: (source) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      notify.success(
        source.is_enabled ? "Agents can use this knowledge" : "Knowledge turned off",
        source.is_enabled ? undefined : "It is kept, but agents stop using it.",
      );
    },
    onError: (error) => notify.error("Could not update knowledge", error.message),
  });
};

export const useReplaceKnowledgeAgents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replaceKnowledgeAgents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      notify.success("Agent access updated");
    },
    onError: (error) => notify.error("Could not update agent access", error.message),
  });
};

export const useDeleteKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      notify.success("Knowledge deleted");
    },
    onError: (error) => notify.error("Could not delete knowledge", error.message),
  });
};

export const useRefreshKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      notify.success("Refreshing", "The AI will use the latest version shortly.");
    },
    onError: (error) => notify.error("Could not refresh knowledge", error.message),
  });
};

export const useCreateKnowledgeVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledgeVersion,
    onSuccess: (source) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      notify.success(`Saved as version ${source.current_version}`, "Processing has started.");
    },
    onError: (error) => notify.error("Could not save the new version", error.message),
  });
};

export const useRestoreKnowledgeVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreKnowledgeVersion,
    onSuccess: (source) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
      notify.success(`Restored as version ${source.current_version}`, "Processing has started.");
    },
    onError: (error) => notify.error("Could not restore that version", error.message),
  });
};
