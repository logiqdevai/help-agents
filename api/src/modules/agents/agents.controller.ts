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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { AgentsService } from './agents.service';
import { AgentConfigService } from './services/agent-config.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentQuerySchema, AgentQueryType } from './dto/agent-query.schema';
import {
  ReplaceCrmToolsDto,
  ReplaceGoalItemsDto,
  ReplaceKnowledgeSourcesDto,
  ReplaceOutcomesDto,
  ReplaceQuestionsDto,
  ReplaceTransferOutcomesDto,
} from './dto/replace-children.dto';
import {
  AgentListItemEntity,
  AgentOverviewEntity,
  AgentReadinessEntity,
} from './entities/agent.entity';

@ApiTags('Agents')
@Controller('agents')
@CompanyAuth()
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly configService: AgentConfigService,
  ) {}

  @Get()
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: 'List agents' })
  @ApiResponse({ status: 200, description: 'Paginated agents', type: [AgentListItemEntity] })
  list(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(AgentQuerySchema)) query: AgentQueryType,
  ) {
    return this.agentsService.list(ctx, query);
  }

  @Post()
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Create an agent (starts as a draft with default outcomes)' })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(ctx, dto);
  }

  @Get(':id')
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: 'Get the full configuration of an agent' })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.findOne(ctx, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Update basics and behavior settings' })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Delete an agent (soft delete; unassigns phone numbers)' })
  remove(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.remove(ctx, id);
  }

  @Post(':id/duplicate')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Duplicate an agent as a new draft (without phone numbers)' })
  duplicate(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.duplicate(ctx, id);
  }

  @Get(':id/overview')
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: 'Agent overview page data' })
  @ApiResponse({ status: 200, type: AgentOverviewEntity })
  overview(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.overview(ctx, id);
  }

  @Get(':id/readiness')
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: 'Setup progress and what still blocks activation' })
  @ApiResponse({ status: 200, type: AgentReadinessEntity })
  readiness(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.getReadiness(ctx, id);
  }

  @Post(':id/activate')
  @HttpCode(200)
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Turn the agent on' })
  @ApiResponse({ status: 400, description: 'AGENT_NOT_READY with the list of blockers' })
  activate(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.activate(ctx, id);
  }

  @Post(':id/deactivate')
  @HttpCode(200)
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Turn the agent off' })
  deactivate(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.deactivate(ctx, id);
  }

  @Post(':id/resync')
  @HttpCode(200)
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Retry preparing the agent after a failure' })
  resync(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.resync(ctx, id);
  }

  @Put(':id/goal-items')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Replace the structured goal checklist' })
  replaceGoalItems(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceGoalItemsDto,
  ) {
    return this.configService.replaceGoalItems(ctx, id, dto);
  }

  @Put(':id/questions')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Replace the list of questions' })
  replaceQuestions(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceQuestionsDto,
  ) {
    return this.configService.replaceQuestions(ctx, id, dto);
  }

  @Put(':id/outcomes')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Replace the possible call outcomes' })
  replaceOutcomes(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceOutcomesDto,
  ) {
    return this.configService.replaceOutcomes(ctx, id, dto);
  }

  @Put(':id/transfer-outcomes')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Choose which outcomes hand the call to a human' })
  replaceTransferOutcomes(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceTransferOutcomesDto,
  ) {
    return this.configService.replaceTransferOutcomes(ctx, id, dto);
  }

  @Get(':id/crm-tools')
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: "The connected CRM's tools with the ones this agent may use flagged" })
  getCrmTools(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.configService.getCrmTools(ctx, id);
  }

  @Put(':id/crm-tools')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Choose the CRM tools this agent is allowed to use' })
  replaceCrmTools(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceCrmToolsDto,
  ) {
    return this.configService.replaceCrmTools(ctx, id, dto);
  }

  @Put(':id/knowledge-sources')
  @RequirePermissions(Permissions.AGENTS_WRITE)
  @ApiOperation({ summary: 'Choose the knowledge sources this agent can use' })
  replaceKnowledgeSources(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceKnowledgeSourcesDto,
  ) {
    return this.configService.replaceKnowledgeSources(ctx, id, dto);
  }
}
