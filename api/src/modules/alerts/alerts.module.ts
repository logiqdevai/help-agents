import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { CompanyAlertsService } from './company-alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [CompanyAlertsService],
})
export class AlertsModule {}
