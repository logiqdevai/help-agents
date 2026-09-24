import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const KnowledgeSourceTypes = {
  TEXT: "TEXT",
  FILE: "FILE",
  GOOGLE_DOCS: "GOOGLE_DOCS",
  NOTION: "NOTION",
  GOOGLE_DRIVE: "GOOGLE_DRIVE",
  DROPBOX: "DROPBOX",
  SHAREPOINT: "SHAREPOINT",
} as const;
export type KnowledgeSourceType = (typeof KnowledgeSourceTypes)[keyof typeof KnowledgeSourceTypes];

export const KnowledgeStatuses = {
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;
export type KnowledgeStatus = (typeof KnowledgeStatuses)[keyof typeof KnowledgeStatuses];

/** The list filter: an API status, or "DISABLED" for sources the user switched off. */
export const KnowledgeStatusFilters = {
  ...KnowledgeStatuses,
  DISABLED: "DISABLED",
} as const;
export type KnowledgeStatusFilter = (typeof KnowledgeStatusFilters)[keyof typeof KnowledgeStatusFilters];

/** How new knowledge is added in the add form (and how a new version is provided). */
export const KnowledgeAddModes = {
  TEXT: "text",
  FILE: "file",
} as const;
export type KnowledgeAddMode = (typeof KnowledgeAddModes)[keyof typeof KnowledgeAddModes];

export interface KnowledgeUserRef {
  id: string;
  name: string | null;
}

export interface KnowledgeAgentRef {
  id: string;
  name: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  status: KnowledgeStatus;
  is_enabled: boolean;
  current_version: number;
  last_error: string | null;
  added_by: KnowledgeUserRef | null;
  created_at: string;
  updated_at: string;
  last_refreshed_at: string | null;
  used_by: KnowledgeAgentRef[];
}

export interface KnowledgeVersionSummary {
  version: number;
  status: KnowledgeStatus;
  error: string | null;
  is_current: boolean;
  content_length: number;
  has_document: boolean;
  created_by: KnowledgeUserRef | null;
  created_at: string;
  indexed_at: string | null;
}

export interface KnowledgeVersionDetail extends KnowledgeVersionSummary {
  content: string;
  document: { id: string; filename: string; mimetype: string; size: number } | null;
}

export interface KnowledgeSourceDetail extends KnowledgeSource {
  content: string | null;
  versions: KnowledgeVersionSummary[];
}

export interface KnowledgeStats {
  total: number;
  ready: number;
  processing: number;
  failed: number;
  disabled: number;
}

export interface KnowledgeQuery extends PaginationQuery {
  search?: string;
  status?: KnowledgeStatus | "all";
  type?: KnowledgeSourceType | "all";
  is_enabled?: boolean;
  agent_uuid?: string | "all";
  order_by?: "created_at" | "updated_at" | "name";
  order_direction?: "asc" | "desc";
}

export interface CreateKnowledgeDto {
  name: string;
  content: string;
}

export interface UpdateKnowledgeDto {
  name?: string;
  is_enabled?: boolean;
}

/** A new version is either typed text or a replacement file. */
export type CreateKnowledgeVersionDto = { content: string } | { file: File };

/** A create that also chose which agents may use the new source. */
export interface CreateKnowledgeInput {
  dto: CreateKnowledgeDto;
  agent_uuids: string[];
}

export interface UploadKnowledgeInput {
  files: File[];
  agent_uuids: string[];
}

export interface CreateKnowledgeResult {
  sources: KnowledgeSourceDetail[];
  /** Files the API rejected, with the reason. */
  failures: { filename: string; message: string }[];
  /** Set when the source was saved but choosing its agents failed. */
  agentsError: string | null;
}
