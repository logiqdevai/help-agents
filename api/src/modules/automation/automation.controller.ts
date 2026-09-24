import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { AutomationRulesService } from './services/automation-rules.service';
import { CreateAutomationRuleDto } from './dto/create-automation-rule.dto';
import { SetRuleEnabledDto, UpdateAutomationRuleDto } from './dto/update-automation-rule.dto';
import { AutomationRuleQuerySchema, AutomationRuleQueryType } from './dto/automation-rule-query.schema';
import { AutomationRuleEntity } from './entities/automation-rule.entity';

@ApiTags('Automation Rules')
@CompanyAuth()
@Controller('automation-rules')
export class AutomationController {
  constructor(private readonly rules: AutomationRulesService) {}

  @Post()
  @RequirePermissions(Permissions.AUTOMATION_MANAGE)
  @ApiOperation({ summary: 'Create a "when this happens, do that" rule' })
  @ApiResponse({ status: 201, type: AutomationRuleEntity })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateAutomationRuleDto) {
    return this.rules.create(ctx, dto);
  }

  @Get()
  @RequirePermissions(Permissions.AUTOMATION_READ)
  @ApiOperation({ summary: 'List automation rules' })
  @ApiQuery({ name: 'trigger', required: false })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'include_company_wide', required: false, description: 'With agent_uuid: also company-wide rules' })
  @ApiQuery({ name: 'is_enabled', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(AutomationRuleQuerySchema)) query: AutomationRuleQueryType,
  ) {
    return this.rules.findAll(ctx, query);
  }

  @Get(':id')
  @RequirePermissions(Permissions.AUTOMATION_READ)
  @ApiOperation({ summary: 'Get an automation rule with its actions' })
  @ApiResponse({ status: 200, type: AutomationRuleEntity })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.rules.findOne(ctx, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.AUTOMATION_MANAGE)
  @ApiOperation({ summary: 'Update a rule; sending `actions` replaces all its actions' })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutomationRuleDto,
  ) {
    return this.rules.update(ctx, id, dto);
  }

  @Patch(':id/enabled')
  @RequirePermissions(Permissions.AUTOMATION_MANAGE)
  @ApiOperation({ summary: 'Enable or disable a rule' })
  setEnabled(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetRuleEnabledDto,
  ) {
    return this.rules.setEnabled(ctx, id, dto.is_enabled);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.AUTOMATION_MANAGE)
  @ApiOperation({ summary: 'Delete a rule' })
  remove(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.rules.remove(ctx, id);
  }
}
