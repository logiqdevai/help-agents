import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

/** Retell LLMs are the "response engine" an agent uses (prompt, tools, model). */
@Injectable()
export class RetellLlmsService {
  private readonly logger = new Logger(RetellLlmsService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async createLlm(params: Retell.LlmCreateParams) {
    try {
      return await this.retellConfig.getRetellClient().llm.create(params);
    } catch (error) {
      this.logger.error(`Error creating LLM: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async getLlm(llmId: string, params?: Retell.LlmRetrieveParams) {
    try {
      return await this.retellConfig.getRetellClient().llm.retrieve(llmId, params);
    } catch (error) {
      this.logger.error(`Error getting LLM ${llmId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listLlms(params?: Retell.LlmListParams) {
    try {
      return await this.retellConfig.getRetellClient().llm.list(params);
    } catch (error) {
      this.logger.error(`Error listing LLMs: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async updateLlm(llmId: string, params: Retell.LlmUpdateParams) {
    try {
      return await this.retellConfig.getRetellClient().llm.update(llmId, params);
    } catch (error) {
      this.logger.error(`Error updating LLM ${llmId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deleteLlm(llmId: string, params?: Retell.LlmDeleteParams) {
    try {
      await this.retellConfig.getRetellClient().llm.delete(llmId, params);
    } catch (error) {
      this.logger.error(`Error deleting LLM ${llmId}: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
