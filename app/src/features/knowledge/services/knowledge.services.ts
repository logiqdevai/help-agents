import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CreateKnowledgeInput,
  CreateKnowledgeResult,
  CreateKnowledgeVersionDto,
  KnowledgeQuery,
  KnowledgeSource,
  KnowledgeSourceDetail,
  KnowledgeStats,
  KnowledgeVersionDetail,
  UpdateKnowledgeDto,
  UploadKnowledgeInput,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getKnowledgeSources = async (
  query?: KnowledgeQuery,
): Promise<PaginatedResponse<KnowledgeSource>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.knowledge.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch knowledge sources. Please try again."));
  }
};

export const getKnowledgeStats = async (): Promise<KnowledgeStats> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.knowledge.stats);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch knowledge totals."));
  }
};

export const getKnowledgeSource = async (id: string): Promise<KnowledgeSourceDetail> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.knowledge.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the knowledge source."));
  }
};

export const getKnowledgeVersion = async (id: string, version: number): Promise<KnowledgeVersionDetail> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.knowledge.version(id, version));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch that version."));
  }
};

/** Points the source at the chosen agents; returns an error message instead of throwing (the source already exists). */
const attachAgents = async (sourceId: string, agentUuids: string[]): Promise<string | null> => {
  if (!agentUuids.length) return null;
  try {
    await axiosInstance.put(ApiRoutes.knowledge.agents(sourceId), { agent_uuids: agentUuids });
    return null;
  } catch (error) {
    return getApiErrorMessage(error, "The agents could not be updated.");
  }
};

export const createKnowledge = async ({
  dto,
  agent_uuids,
}: CreateKnowledgeInput): Promise<CreateKnowledgeResult> => {
  let source: KnowledgeSourceDetail;
  try {
    source = (await axiosInstance.post(ApiRoutes.knowledge.root, dto)).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the knowledge."));
  }
  return { sources: [source], failures: [], agentsError: await attachAgents(source.id, agent_uuids) };
};

export const uploadKnowledge = async ({
  files,
  agent_uuids,
}: UploadKnowledgeInput): Promise<CreateKnowledgeResult> => {
  const sources: KnowledgeSourceDetail[] = [];
  const failures: CreateKnowledgeResult["failures"] = [];

  for (const file of files) {
    const body = new FormData();
    body.append("file", file);
    try {
      sources.push((await axiosInstance.post(ApiRoutes.knowledge.upload, body)).data);
    } catch (error) {
      failures.push({ filename: file.name, message: getApiErrorMessage(error, "The file could not be uploaded.") });
    }
  }

  if (!sources.length) throw new Error(failures[0]?.message ?? "The file could not be uploaded.");

  const agentErrors = await Promise.all(sources.map((source) => attachAgents(source.id, agent_uuids)));
  return { sources, failures, agentsError: agentErrors.find(Boolean) ?? null };
};

export const updateKnowledge = async ({
  id,
  dto,
}: {
  id: string;
  dto: UpdateKnowledgeDto;
}): Promise<KnowledgeSourceDetail> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.knowledge.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the knowledge source."));
  }
};

export const replaceKnowledgeAgents = async ({
  id,
  agent_uuids,
}: {
  id: string;
  agent_uuids: string[];
}): Promise<KnowledgeSourceDetail> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.knowledge.agents(id), { agent_uuids });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update which agents use this knowledge."));
  }
};

export const deleteKnowledge = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(ApiRoutes.knowledge.detail(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete the knowledge source."));
  }
};

export const refreshKnowledge = async (id: string): Promise<KnowledgeSourceDetail> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.knowledge.refresh(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not refresh the knowledge source."));
  }
};

export const createKnowledgeVersion = async ({
  id,
  dto,
}: {
  id: string;
  dto: CreateKnowledgeVersionDto;
}): Promise<KnowledgeSourceDetail> => {
  try {
    let body: FormData | { content: string };
    if ("file" in dto) {
      body = new FormData();
      body.append("file", dto.file);
    } else {
      body = dto;
    }
    const response = await axiosInstance.post(ApiRoutes.knowledge.versions(id), body);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save the new version."));
  }
};

export const restoreKnowledgeVersion = async ({
  id,
  version,
}: {
  id: string;
  version: number;
}): Promise<KnowledgeSourceDetail> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.knowledge.restoreVersion(id, version));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not restore that version."));
  }
};
