import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { AnalyticsService } from './analytics.service';
import {
  UsageQuerySchema,
  UsageQueryType,
  UsageTimeseriesQuerySchema,
  UsageTimeseriesQueryType,
} from './dto/period-query.schema';
import { UsageReportEntity, UsageTimeseriesEntity } from './entities/dashboard.entity';

@ApiTags('Analytics')
@Controller('analytics')
@CompanyAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('usage')
  @RequirePermissions(Permissions.ANALYTICS_READ)
  @ApiOperation({ summary: 'Company-wide usage totals and per-agent breakdown' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', '7d', '30d', 'custom'] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'include_test', required: false, enum: ['true', 'false'] })
  @ApiResponse({ status: 200, type: UsageReportEntity })
  getUsage(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(UsageQuerySchema)) query: UsageQueryType,
  ) {
    return this.analyticsService.getUsage(ctx, query);
  }

  @Get('usage/timeseries')
  @RequirePermissions(Permissions.ANALYTICS_READ)
  @ApiOperation({ summary: 'Calls, minutes and cost per time bucket' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', '7d', '30d', 'custom'] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'bucket', required: false, enum: ['hour', 'day', 'week'] })
  @ApiQuery({ name: 'include_test', required: false, enum: ['true', 'false'] })
  @ApiResponse({ status: 200, type: UsageTimeseriesEntity })
  getTimeseries(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(UsageTimeseriesQuerySchema)) query: UsageTimeseriesQueryType,
  ) {
    return this.analyticsService.getTimeseries(ctx, query);
  }
}
