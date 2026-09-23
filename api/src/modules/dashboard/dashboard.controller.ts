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
import { DashboardService } from './dashboard.service';
import { DashboardQuerySchema, DashboardQueryType } from './dto/period-query.schema';
import { DashboardResponseEntity } from './entities/dashboard.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
@CompanyAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermissions(Permissions.ANALYTICS_READ)
  @ApiOperation({ summary: 'Summary of recent voice agent activity' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', '7d', '30d', 'custom'] })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date, required for period=custom' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date, required for period=custom' })
  @ApiQuery({ name: 'include_test', required: false, enum: ['true', 'false'] })
  @ApiResponse({ status: 200, type: DashboardResponseEntity })
  getDashboard(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(DashboardQuerySchema)) query: DashboardQueryType,
  ) {
    return this.dashboardService.getDashboard(ctx, query);
  }
}
