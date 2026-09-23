import { Injectable, Logger } from '@nestjs/common';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

@Injectable()
export class RetellVoicesService {
  private readonly logger = new Logger(RetellVoicesService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async getVoice(voiceId: string) {
    try {
      return await this.retellConfig.getRetellClient().voice.retrieve(voiceId);
    } catch (error) {
      this.logger.error(`Error getting voice ${voiceId}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listVoices() {
    try {
      return await this.retellConfig.getRetellClient().voice.list();
    } catch (error) {
      this.logger.error(`Error listing voices: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
