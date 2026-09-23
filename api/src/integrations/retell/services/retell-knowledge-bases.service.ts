import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

/**
 * Retell knowledge bases are attached to an agent through its LLM
 * (`knowledge_base_ids`). Sources can't be edited in place: to change content,
 * create a new knowledge base (or delete the source and add it again).
 */
@Injectable()
export class RetellKnowledgeBasesService {
  private readonly logger = new Logger(RetellKnowledgeBasesService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async createKnowledgeBase(params: Retell.KnowledgeBaseCreateParams) {
    try {
      return await this.retellConfig.getRetellClient().knowledgeBase.create(params);
    } catch (error) {
      this.logger.error(`Error creating knowledge base: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async getKnowledgeBase(knowledgeBaseId: string) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .knowledgeBase.retrieve(knowledgeBaseId);
    } catch (error) {
      this.logger.error(`Error getting knowledge base ${knowledgeBaseId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listKnowledgeBases() {
    try {
      return await this.retellConfig.getRetellClient().knowledgeBase.list();
    } catch (error) {
      this.logger.error(`Error listing knowledge bases: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async addSources(knowledgeBaseId: string, params: Retell.KnowledgeBaseAddSourcesParams) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .knowledgeBase.addSources(knowledgeBaseId, params);
    } catch (error) {
      this.logger.error(`Error adding sources to knowledge base ${knowledgeBaseId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deleteSource(sourceId: string, knowledgeBaseId: string) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .knowledgeBase.deleteSource(sourceId, { knowledge_base_id: knowledgeBaseId });
    } catch (error) {
      this.logger.error(`Error deleting source ${sourceId} from knowledge base ${knowledgeBaseId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deleteKnowledgeBase(knowledgeBaseId: string) {
    try {
      await this.retellConfig.getRetellClient().knowledgeBase.delete(knowledgeBaseId);
    } catch (error) {
      this.logger.error(`Error deleting knowledge base ${knowledgeBaseId}: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
