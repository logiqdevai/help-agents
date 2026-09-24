import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { ScheduledCallsService } from './services/scheduled-calls.service';
import { RetryRulesService } from './services/retry-rules.service';
import { CreateScheduledCallDto } from './dto/create-scheduled-call.dto';
import { UpdateScheduledCallDto } from './dto/update-scheduled-call.dto';
import { CancelForContactDto } from './dto/cancel-for-contact.dto';
import { UpsertRetryRuleDto } from './dto/upsert-retry-rule.dto';
import { ScheduledCallQuerySchema, ScheduledCallQueryType } from './dto/scheduled-call-query.schema';
import { ScheduledCallEntity, ScheduledCallCounts, RetryRuleEntity } from './entities/scheduling.entity';

@ApiTags('Scheduled Calls')
@CompanyAuth()
@Controller('scheduled-calls')
export class ScheduledCallsController {
  constructor(private readonly scheduledCalls: ScheduledCallsService) {}

  @Post()
  @RequirePermissions(Permissions.SCHEDULING_MANAGE)
  @ApiOperation({ summary: 'Schedule a call to a contact' })
  @ApiResponse({ status: 201, type: ScheduledCallEntity })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateScheduledCallDto) {
    return this.scheduledCalls.create(ctx, dto);
  }

  @Get()
  @RequirePermissions(Permissions.SCHEDULING_READ)
  @ApiOperation({ summary: 'List scheduled calls and pending follow-ups' })
  @ApiQuery({ name: 'status', required: false, description: 'Comma separated scheduled call statuses' })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Contact name or phone' })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'contact_uuid', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(ScheduledCallQuerySchema)) query: ScheduledCallQueryType,
  ) {
    return this.scheduledCalls.findAll(ctx, query);
  }

  @Get('counts')
  @RequirePermissions(Permissions.SCHEDULING_READ)
  @ApiOperation({ summary: 'Counts per tab: pending, completed, canceled / skipped' })
  @ApiResponse({ status: 200, type: ScheduledCallCounts })
  getCounts(@CompanyContext() ctx: CompanyContextData) {
    return this.scheduledCalls.getCounts(ctx);
  }

  @Post('cancel-for-contact')
  @HttpCode(200)
  @RequirePermissions(Permissions.SCHEDULING_MANAGE)
  @ApiOperation({ summary: 'Cancel all pending scheduled calls of a contact' })
  cancelForContact(@CompanyContext() ctx: CompanyContextData, @Body() dto: CancelForContactDto) {
    return this.scheduledCalls.cancelForContact(ctx, dto);
  }

  @Get(':id')
  @RequirePermissions(Permissions.SCHEDULING_READ)
  @ApiOperation({ summary: 'Get a scheduled call' })
  @ApiResponse({ status: 200, type: ScheduledCallEntity })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.scheduledCalls.findOne(ctx, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.SCHEDULING_MANAGE)
  @ApiOperation({ summary: 'Reschedule a pending call' })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduledCallDto,
  ) {
    return this.scheduledCalls.update(ctx, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.SCHEDULING_MANAGE)
  @ApiOperation({ summary: 'Cancel a pending scheduled call' })
  cancel(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.scheduledCalls.cancel(ctx, id);
  }
}

@ApiTags('Retry Rules')
@CompanyAuth()
@Controller('agents/:agentId/retry-rule')
export class RetryRulesController {
  constructor(private readonly retryRules: RetryRulesService) {}

  @Get()
  @RequirePermissions(Permissions.SCHEDULING_READ)
  @ApiOperation({ summary: "Get an agent's retry rule (defaults when none is configured)" })
  @ApiResponse({ status: 200, type: RetryRuleEntity })
  get(@CompanyContext() ctx: CompanyContextData, @Param('agentId', ParseUUIDPipe) agentId: string) {
    return this.retryRules.get(ctx, agentId);
  }

  @Put()
  @RequirePermissions(Permissions.SCHEDULING_MANAGE)
  @ApiOperation({ summary: "Create or update an agent's retry rule" })
  @ApiResponse({ status: 200, type: RetryRuleEntity })
  upsert(
    @CompanyContext() ctx: CompanyContextData,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: UpsertRetryRuleDto,
  ) {
    return this.retryRules.upsert(ctx, agentId, dto);
  }
}
