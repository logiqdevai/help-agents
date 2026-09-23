import { Module } from '@nestjs/common';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CallPlacementService } from './services/call-placement.service';
import { CallingHoursService } from './services/calling-hours.service';
import { CallActionsService } from './services/call-actions.service';
import { PricingService } from './services/pricing.service';
import { PricingRatesService } from './services/pricing-rates.service';
import { VoiceToolsService } from './services/voice-tools.service';
import { VoiceToolsController } from './controllers/voice-tools.controller';
import { PricingAdminController } from './controllers/pricing-admin.controller';
import { PricingController } from './controllers/pricing.controller';

const exported = [CallPlacementService, CallingHoursService, CallActionsService, PricingService];

@Module({
  imports: [VoiceProviderModule, IntegrationsModule],
  controllers: [VoiceToolsController, PricingAdminController, PricingController],
  providers: [...exported, PricingRatesService, VoiceToolsService],
  exports: exported,
})
export class CallEngineModule {}
