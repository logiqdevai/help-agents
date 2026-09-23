import { KnowledgeSourceType, KnowledgeStatus } from 'generated/prisma';

export interface KnowledgeUserRef {
  id: string;
  name: string | null;
}

export interface KnowledgeAgentRef {
  id: string;
  name: string;
}

export interface KnowledgeVersionSummary {
  version: number;
  status: KnowledgeStatus;
  error: string | null;
  is_current: boolean;
  content_length: number;
  has_document: boolean;
  created_by: KnowledgeUserRef | null;
  created_at: Date;
  indexed_at: Date | null;
}

export interface KnowledgeVersionDetail extends KnowledgeVersionSummary {
  content: string;
  document: { id: string; filename: string; mimetype: string; size: number } | null;
}

export interface KnowledgeSourceResponse {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  status: KnowledgeStatus;
  is_enabled: boolean;
  current_version: number;
  last_error: string | null;
  added_by: KnowledgeUserRef | null;
  created_at: Date;
  updated_at: Date;
  last_refreshed_at: Date | null;
  used_by: KnowledgeAgentRef[];
}

export interface KnowledgeSourceDetailResponse extends KnowledgeSourceResponse {
  content: string | null;
  versions: KnowledgeVersionSummary[];
}
