import { Module } from '@nestjs/common';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentConfigService } from './services/agent-config.service';
import { AgentSyncService } from './services/agent-sync.service';

@Module({
  imports: [VoiceProviderModule],
  controllers: [AgentsController],
  providers: [AgentsService, AgentConfigService, AgentSyncService],
  exports: [AgentsService],
})
export class AgentsModule {}
