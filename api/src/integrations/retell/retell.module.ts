import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RetellConfig } from './retell.config';
import { RetellCallsService } from './services/retell-calls.service';
import { RetellAgentsService } from './services/retell-agents.service';
import { RetellLlmsService } from './services/retell-llms.service';
import { RetellVoicesService } from './services/retell-voices.service';
import { RetellPhoneNumbersService } from './services/retell-phone-numbers.service';
import { RetellWebhooksService } from './services/retell-webhooks.service';

const providers = [
  RetellConfig,
  RetellCallsService,
  RetellAgentsService,
  RetellLlmsService,
  RetellVoicesService,
  RetellPhoneNumbersService,
  RetellWebhooksService,
];

@Module({
  imports: [ConfigModule],
  providers,
  exports: providers,
})
export class RetellIntegrationModule {}
