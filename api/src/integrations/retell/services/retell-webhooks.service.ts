import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';

@Injectable()
export class RetellWebhooksService {
  private readonly logger = new Logger(RetellWebhooksService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  /**
   * Verifies the `x-retell-signature` header of a Retell webhook.
   * `rawBody` must be the unparsed request body, exactly as received.
   */
  async verifySignature(rawBody: string, signature: string): Promise<boolean> {
    if (!signature) return false;

    try {
      return await Retell.verify(rawBody, this.retellConfig.getApiKey(), signature);
    } catch (error) {
      this.logger.error(`Error verifying Retell webhook: ${error.message}`);
      return false;
    }
  }
}
