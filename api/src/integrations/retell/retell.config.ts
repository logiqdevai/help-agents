import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Retell from 'retell-sdk';

@Injectable()
export class RetellConfig {
  private retellClient: Retell | null = null;
  private apiKey: string | null = null;
  private readonly logger = new Logger(RetellConfig.name);

  constructor(private readonly configService: ConfigService) {
    this.initRetell();
  }

  private initRetell() {
    const apiKey = this.configService.get<string>('RETELL_API_KEY');
    if (!apiKey) {
      this.logger.error('RETELL_API_KEY is not configured');
      return;
    }

    this.apiKey = apiKey;
    this.retellClient = new Retell({ apiKey });
    this.logger.debug('Retell initialized');
  }

  getRetellClient(): Retell {
    if (!this.retellClient) {
      throw new ServiceUnavailableException('Retell client is not initialized');
    }

    return this.retellClient;
  }

  getApiKey(): string {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Retell client is not initialized');
    }

    return this.apiKey;
  }
}
