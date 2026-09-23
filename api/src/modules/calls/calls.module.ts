import { Module } from '@nestjs/common';
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { CallEngineModule } from '../call-engine/call-engine.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { AutomationModule } from '../automation/automation.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CallsController } from './controllers/calls.controller';
import { VoiceWebhooksController } from './controllers/voice-webhooks.controller';
import { CallsService } from './services/calls.service';
import { CallTimelineService } from './services/call-timeline.service';
import { CallRecordingsService } from './services/call-recordings.service';
import { InboundCallService } from './services/inbound-call.service';
import { CallProcessingService } from './services/call-processing.service';
import { ProviderEventsService } from './services/provider-events.service';
import { CallReconciliationService } from './services/call-reconciliation.service';

@Module({
  imports: [
    VoiceProviderModule,
    CallEngineModule,
    SchedulingModule,
    AutomationModule,
    IntegrationsModule,
    GcsIntegrationModule,
  ],
  controllers: [CallsController, VoiceWebhooksController],
  providers: [
    CallsService,
    CallTimelineService,
    CallRecordingsService,
    InboundCallService,
    CallProcessingService,
    ProviderEventsService,
    CallReconciliationService,
  ],
})
export class CallsModule {}
