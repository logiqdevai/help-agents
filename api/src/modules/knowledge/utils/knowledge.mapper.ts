import { Prisma } from 'generated/prisma';
import {
  KnowledgeSourceResponse,
  KnowledgeVersionDetail,
  KnowledgeVersionSummary,
} from '../interfaces/knowledge.interface';

export const SOURCE_INCLUDE = {
  added_by: { select: { id: true, name: true } },
  agents: { include: { agent: { select: { id: true, name: true, deleted_at: true } } } },
} satisfies Prisma.KnowledgeSourceInclude;

export type SourceRow = Prisma.KnowledgeSourceGetPayload<{ include: typeof SOURCE_INCLUDE }>;

export const VERSION_INCLUDE = {
  created_by: { select: { id: true, name: true } },
  document: { select: { id: true, filename: true, mimetype: true, size: true } },
} satisfies Prisma.KnowledgeSourceVersionInclude;

export type VersionRow = Prisma.KnowledgeSourceVersionGetPayload<{ include: typeof VERSION_INCLUDE }>;

export function toSourceResponse(source: SourceRow): KnowledgeSourceResponse {
  return {
    id: source.id,
    name: source.name,
    type: source.type,
    status: source.status,
    is_enabled: source.is_enabled,
    current_version: source.current_version,
    last_error: source.last_error,
    added_by: source.added_by ? { id: source.added_by.id, name: source.added_by.name } : null,
    created_at: source.created_at,
    updated_at: source.updated_at,
    last_refreshed_at: source.last_refreshed_at,
    used_by: source.agents
      .filter((link) => !link.agent.deleted_at)
      .map((link) => ({ id: link.agent.id, name: link.agent.name })),
  };
}

export function toVersionSummary(version: VersionRow, currentVersion: number): KnowledgeVersionSummary {
  return {
    version: version.version,
    status: version.status,
    error: version.error,
    is_current: version.version === currentVersion,
    content_length: version.content.length,
    has_document: !!version.document_uuid,
    created_by: version.created_by ? { id: version.created_by.id, name: version.created_by.name } : null,
    created_at: version.created_at,
    indexed_at: version.indexed_at,
  };
}

export function toVersionDetail(version: VersionRow, currentVersion: number): KnowledgeVersionDetail {
  return {
    ...toVersionSummary(version, currentVersion),
    content: version.content,
    document: version.document ?? null,
  };
}
