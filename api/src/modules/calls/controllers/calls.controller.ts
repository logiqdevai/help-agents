import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CompanyAuth, CompanyContext, RequirePermissions } from '@/shared/decorators/company.decorator';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { CallsService } from '../services/calls.service';
import { CallsQuerySchema, CallsQueryType } from '../dto/calls-query.schema';
import { CreateCallDto } from '../dto/create-call.dto';
import { CreateTestCallDto } from '../dto/create-test-call.dto';
import { CallDetail, CallListItem } from '../entities/call.entity';

@ApiTags('Calls')
@Controller('calls')
@CompanyAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'List calls with filters' })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date / date-time (company timezone for plain dates)' })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'outcome_key', required: false })
  @ApiQuery({ name: 'status', required: false, description: 'Comma separated call statuses' })
  @ApiQuery({ name: 'direction', required: false, enum: ['INBOUND', 'OUTBOUND'] })
  @ApiQuery({ name: 'contact_uuid', required: false })
  @ApiQuery({ name: 'integration_uuid', required: false, description: 'CRM connection' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_test', required: false, enum: ['true', 'false', 'all'] })
  @ApiQuery({ name: 'order_by', required: false, enum: ['started_at', 'created_at'] })
  @ApiQuery({ name: 'order_direction', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Paginated calls', type: CallListItem, isArray: true })
  findAll(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(CallsQuerySchema)) query: CallsQueryType,
  ) {
    return this.callsService.list(ctx, query);
  }

  @Get('stats/filters')
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'Options for the call list filters' })
  getFilters(@CompanyContext() ctx: CompanyContextData) {
    return this.callsService.getFilterOptions(ctx);
  }

  @Post('test')
  @RequirePermissions(Permissions.CALLS_PLACE)
  @ApiOperation({ summary: 'Place a live test call to try an agent' })
  @ApiResponse({ status: 201, type: CallListItem })
  placeTest(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateTestCallDto) {
    return this.callsService.placeTest(ctx, dto);
  }

  @Post()
  @RequirePermissions(Permissions.CALLS_PLACE)
  @ApiOperation({ summary: 'Place a manual outbound call to a contact' })
  @ApiResponse({ status: 201, type: CallListItem })
  placeCall(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateCallDto) {
    return this.callsService.placeManual(ctx, dto);
  }

  @Get(':id')
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'Call details: transcript, summary, gathered information, CRM actions, costs, activity log' })
  @ApiResponse({ status: 200, type: CallDetail })
  @ApiResponse({ status: 404, description: 'Call not found' })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.getOne(ctx, id);
  }

  @Get(':id/events')
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'Behind-the-scenes activity trail of a call' })
  getEvents(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.getEvents(ctx, id);
  }

  @Get(':id/recording')
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'Short-lived playback URL for the call recording' })
  @ApiResponse({ status: 404, description: 'No recording available' })
  getRecording(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.getRecording(ctx, id);
  }

  @Get(':id/recording/download')
  @RequirePermissions(Permissions.CALLS_READ)
  @ApiOperation({ summary: 'Download the call recording (redirects to a short-lived URL)' })
  async downloadRecording(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { url } = await this.callsService.getRecording(ctx, id);
    await this.callsService.logRecordingDownload(ctx, id);
    res.redirect(302, url);
  }

  @Post(':id/actions/:actionId/retry')
  @HttpCode(200)
  @RequirePermissions(Permissions.CALLS_MANAGE)
  @ApiOperation({ summary: 'Retry a failed CRM update / action of a call' })
  retryAction(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('actionId', ParseUUIDPipe) actionId: string,
  ) {
    return this.callsService.retryAction(ctx, id, actionId);
  }

  @Post(':id/stop')
  @HttpCode(200)
  @RequirePermissions(Permissions.CALLS_MANAGE)
  @ApiOperation({ summary: 'Stop a call that is still in progress' })
  stop(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.stop(ctx, id);
  }
}
