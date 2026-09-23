import { Module } from '@nestjs/common';
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeConnectorRegistry } from './connectors/knowledge-connector.registry';
import { KnowledgeProcessingService } from './services/knowledge-processing.service';

@Module({
  imports: [VoiceProviderModule, GcsIntegrationModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, KnowledgeProcessingService, KnowledgeConnectorRegistry],
  exports: [KnowledgeService, KnowledgeConnectorRegistry],
})
export class KnowledgeModule {}
