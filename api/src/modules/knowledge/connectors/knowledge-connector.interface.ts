import { Integration, KnowledgeSource, KnowledgeSourceType } from 'generated/prisma';

export interface KnowledgeConnectorResult {
  content: string;
  /** Reference inside the external system (Google Doc id, Notion page id, ...). */
  external_ref?: string | null;
}

/**
 * Pulls text from an external system (Google Docs, Notion, ...) for a knowledge source.
 * Register implementations with KnowledgeConnectorRegistry to add new source types.
 */
export interface KnowledgeConnector {
  readonly type: KnowledgeSourceType;
  fetchContent(
    source: Pick<KnowledgeSource, 'id' | 'company_uuid' | 'external_ref' | 'type'>,
    integration: Integration,
  ): Promise<KnowledgeConnectorResult>;
}
