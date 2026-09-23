import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CallStatsService } from './call-stats.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController, AnalyticsController],
  providers: [DashboardService, AnalyticsService, CallStatsService],
  exports: [CallStatsService],
})
export class DashboardModule {}
