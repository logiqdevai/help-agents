import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

@Injectable()
export class RetellCallsService {
  private readonly logger = new Logger(RetellCallsService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async createPhoneCall(params: Retell.CallCreatePhoneCallParams) {
    try {
      return await this.retellConfig.getRetellClient().call.createPhoneCall(params);
    } catch (error) {
      this.logger.error(`Error creating phone call: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async createWebCall(params: Retell.CallCreateWebCallParams) {
    try {
      return await this.retellConfig.getRetellClient().call.createWebCall(params);
    } catch (error) {
      this.logger.error(`Error creating web call: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async registerPhoneCall(params: Retell.CallRegisterPhoneCallParams) {
    try {
      return await this.retellConfig.getRetellClient().call.registerPhoneCall(params);
    } catch (error) {
      this.logger.error(`Error registering phone call: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async getCall(callId: string) {
    try {
      return await this.retellConfig.getRetellClient().call.retrieve(callId);
    } catch (error) {
      this.logger.error(`Error getting call ${callId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listCalls(params?: Retell.CallListParams) {
    try {
      return await this.retellConfig.getRetellClient().call.list(params);
    } catch (error) {
      this.logger.error(`Error listing calls: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async updateCall(callId: string, params: Retell.CallUpdateParams) {
    try {
      return await this.retellConfig.getRetellClient().call.update(callId, params);
    } catch (error) {
      this.logger.error(`Error updating call ${callId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  /** Ends an ongoing call. */
  async stopCall(callId: string) {
    try {
      await this.retellConfig.getRetellClient().call.stop(callId);
    } catch (error) {
      this.logger.error(`Error stopping call ${callId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async rerunCallAnalysis(callId: string) {
    try {
      return await this.retellConfig.getRetellClient().call.rerunAnalysis(callId);
    } catch (error) {
      this.logger.error(`Error rerunning analysis for call ${callId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deleteCall(callId: string) {
    try {
      await this.retellConfig.getRetellClient().call.delete(callId);
    } catch (error) {
      this.logger.error(`Error deleting call ${callId}: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
