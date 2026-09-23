import { Module } from '@nestjs/common';
import { ActivityLogController } from './activity-log.controller';
import { CompanyActivityService } from './company-activity.service';

@Module({
  controllers: [ActivityLogController],
  providers: [CompanyActivityService],
})
export class ActivityLogModule {}
