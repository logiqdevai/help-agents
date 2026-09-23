import { Module } from '@nestjs/common';
import { CallEngineModule } from '../call-engine/call-engine.module';
import { SchedulingService } from './scheduling.service';
import { ScheduledCallsService } from './services/scheduled-calls.service';
import { RetryRulesService } from './services/retry-rules.service';
import { SchedulingDispatcherService } from './services/scheduling-dispatcher.service';
import { RetryRulesController, ScheduledCallsController } from './scheduling.controller';

@Module({
  imports: [CallEngineModule],
  controllers: [ScheduledCallsController, RetryRulesController],
  providers: [
    SchedulingService,
    ScheduledCallsService,
    RetryRulesService,
    SchedulingDispatcherService,
  ],
  exports: [SchedulingService],
})
export class SchedulingModule {}
