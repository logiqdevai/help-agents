import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { CompanyActivityService } from './company-activity.service';
import { ActivityLogQuerySchema, ActivityLogQueryType } from './dto/activity-log-query.schema';
import { ActivityLogEntry } from './entities/activity-log.entity';

@ApiTags('Activity Log')
@Controller('activity-log')
@CompanyAuth()
export class ActivityLogController {
  constructor(private readonly activityService: CompanyActivityService) {}

  @Get()
  @RequirePermissions(Permissions.ACTIVITY_READ)
  @ApiOperation({ summary: 'History of important actions taken in the company account' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'entity_type', required: false })
  @ApiQuery({ name: 'entity_uuid', required: false })
  @ApiQuery({ name: 'user_uuid', required: false })
  @ApiQuery({ name: 'action', required: false, description: 'Prefix match, e.g. "agent."' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200, description: 'Paginated activity entries', type: [ActivityLogEntry] })
  findAll(
    @CompanyContext('company_uuid') companyUuid: string,
    @Query(new ZodValidationPipe(ActivityLogQuerySchema)) query: ActivityLogQueryType,
  ) {
    return this.activityService.findAll(companyUuid, query);
  }
}
