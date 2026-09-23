import { Module } from '@nestjs/common';
import { RetellIntegrationModule } from '@/integrations/retell/retell.module';
import { VoiceProviderService } from './voice-provider.service';
import { VoicesController } from './voices.controller';

@Module({
  imports: [RetellIntegrationModule],
  controllers: [VoicesController],
  providers: [VoiceProviderService],
  exports: [VoiceProviderService],
})
export class VoiceProviderModule {}
