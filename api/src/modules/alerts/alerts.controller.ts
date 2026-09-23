import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { CompanyAlertsService } from './company-alerts.service';
import { DismissAllAlertsDto } from './dto/dismiss-all-alerts.dto';
import { AlertsQuerySchema, AlertsQueryType } from './dto/alerts-query.schema';
import { AlertEntity, AlertsSummaryEntity } from './entities/alert.entity';

@ApiTags('Alerts')
@Controller('alerts')
@CompanyAuth()
export class AlertsController {
  constructor(private readonly alertsService: CompanyAlertsService) {}

  @Get()
  @RequirePermissions(Permissions.ALERTS_READ)
  @ApiOperation({ summary: 'List problems that need attention (open by default)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'RESOLVED', 'DISMISSED', 'ALL'] })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'entity_type', required: false })
  @ApiQuery({ name: 'entity_uuid', required: false })
  @ApiResponse({ status: 200, description: 'Paginated alerts', type: [AlertEntity] })
  findAll(
    @CompanyContext('company_uuid') companyUuid: string,
    @Query(new ZodValidationPipe(AlertsQuerySchema)) query: AlertsQueryType,
  ) {
    return this.alertsService.findAll(companyUuid, query);
  }

  @Get('summary')
  @RequirePermissions(Permissions.ALERTS_READ)
  @ApiOperation({ summary: 'Open alert counts by type and severity' })
  @ApiResponse({ status: 200, type: AlertsSummaryEntity })
  summary(@CompanyContext('company_uuid') companyUuid: string) {
    return this.alertsService.summary(companyUuid);
  }

  @Patch(':id/resolve')
  @RequirePermissions(Permissions.ALERTS_MANAGE)
  @ApiOperation({ summary: 'Mark an alert as resolved' })
  @ApiResponse({ status: 200, type: AlertEntity })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  resolve(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.resolve(ctx, id);
  }

  @Patch(':id/dismiss')
  @RequirePermissions(Permissions.ALERTS_MANAGE)
  @ApiOperation({ summary: 'Dismiss an alert' })
  @ApiResponse({ status: 200, type: AlertEntity })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  dismiss(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.dismiss(ctx, id);
  }

  @Post('dismiss-all')
  @HttpCode(200)
  @RequirePermissions(Permissions.ALERTS_MANAGE)
  @ApiOperation({ summary: 'Dismiss all open alerts, optionally of one type' })
  @ApiResponse({ status: 200, description: 'Number of alerts dismissed' })
  dismissAll(@CompanyContext() ctx: CompanyContextData, @Body() dto: DismissAllAlertsDto) {
    return this.alertsService.dismissAll(ctx, dto.type);
  }
}
