import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentConfigService } from './services/agent-config.service';
import { AgentSyncService } from './services/agent-sync.service';
import { AgentTeamAccessService } from './services/agent-team-access.service';

@Module({
  imports: [VoiceProviderModule, DashboardModule],
  controllers: [AgentsController],
  providers: [AgentsService, AgentConfigService, AgentSyncService, AgentTeamAccessService],
  exports: [AgentsService],
})
export class AgentsModule {}
