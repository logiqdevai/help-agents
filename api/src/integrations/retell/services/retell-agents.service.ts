import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

@Injectable()
export class RetellAgentsService {
  private readonly logger = new Logger(RetellAgentsService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async createAgent(params: Retell.AgentCreateParams) {
    try {
      return await this.retellConfig.getRetellClient().agent.create(params);
    } catch (error) {
      this.logger.error(`Error creating agent: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async getAgent(agentId: string, params?: Retell.AgentRetrieveParams) {
    try {
      return await this.retellConfig.getRetellClient().agent.retrieve(agentId, params);
    } catch (error) {
      this.logger.error(`Error getting agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listAgents(params?: Retell.AgentListParams) {
    try {
      return await this.retellConfig.getRetellClient().agent.list(params);
    } catch (error) {
      this.logger.error(`Error listing agents: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async updateAgent(agentId: string, params: Retell.AgentUpdateParams) {
    try {
      return await this.retellConfig.getRetellClient().agent.update(agentId, params);
    } catch (error) {
      this.logger.error(`Error updating agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async createAgentVersion(agentId: string, params: Retell.AgentCreateVersionParams) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .agent.createVersion(agentId, params);
    } catch (error) {
      this.logger.error(`Error creating version for agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listAgentVersions(agentId: string, params?: Retell.AgentListVersionsParams) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .agent.listVersions(agentId, params);
    } catch (error) {
      this.logger.error(`Error listing versions for agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async publishAgent(agentId: string, params: Retell.AgentPublishParams) {
    try {
      await this.retellConfig.getRetellClient().agent.publish(agentId, params);
    } catch (error) {
      this.logger.error(`Error publishing agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deleteAgent(agentId: string) {
    try {
      await this.retellConfig.getRetellClient().agent.delete(agentId);
    } catch (error) {
      this.logger.error(`Error deleting agent ${agentId}: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
