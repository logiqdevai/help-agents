import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { GoalDataType, GoalRequirement, OutcomeSystemType } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { AgentsService } from '../agents.service';
import { AgentSyncService } from './agent-sync.service';
import {
  ReplaceCrmToolsDto,
  ReplaceGoalItemsDto,
  ReplaceKnowledgeSourcesDto,
  ReplaceOutcomesDto,
  ReplaceQuestionsDto,
  ReplaceTransferOutcomesDto,
} from '../dto/replace-children.dto';
import { catalogueWhere, planKeyedReplace, REQUIRED_SYSTEM_TYPES } from '../utils/agent.utils';

type Ctx = CompanyContextData;

/** Bulk-replace endpoints for an agent's structured configuration (goals, questions, outcomes, tools, knowledge). */
@Injectable()
export class AgentConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agents: AgentsService,
    private readonly sync: AgentSyncService,
    private readonly activity: ActivityLogService,
  ) {}

  async replaceGoalItems(ctx: Ctx, agentId: string, dto: ReplaceGoalItemsDto) {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const existing = await this.prisma.agentGoalItem.findMany({ where: { agent_uuid: agentId } });
    const { plan, deleteIds } = planKeyedReplace(dto.items, existing);

    const resolved = plan.map((entry) => {
      const data_type = entry.item.data_type ?? entry.row?.data_type ?? GoalDataType.STRING;
      const enum_values =
        data_type === GoalDataType.ENUM ? (entry.item.enum_values ?? entry.row?.enum_values ?? []) : [];
      if (data_type === GoalDataType.ENUM && enum_values.length === 0) {
        throw new BadRequestException(`"${entry.item.label}" needs at least one enum value`);
      }
      return { ...entry, data_type, enum_values };
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.agentGoalItem.deleteMany({ where: { agent_uuid: agentId, id: { in: deleteIds } } });

      for (const e of resolved) {
        if (e.row && e.row.key !== e.key) {
          await tx.agentGoalItem.update({ where: { id: e.row.id }, data: { key: `~${e.row.id}` } });
        }
      }

      for (const e of resolved) {
        const data = {
          key: e.key,
          label: e.item.label,
          description: e.item.description ?? e.row?.description ?? null,
          requirement: e.item.requirement ?? e.row?.requirement ?? GoalRequirement.REQUIRED,
          data_type: e.data_type,
          enum_values: e.enum_values,
          position: e.position,
        };
        if (e.row) await tx.agentGoalItem.update({ where: { id: e.row.id }, data });
        else await tx.agentGoalItem.create({ data: { ...data, agent_uuid: agentId } });
      }
      await tx.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } });
    });

    await this.afterChange(ctx, agentId, 'goal_items');
    return this.prisma.agentGoalItem.findMany({
      where: { agent_uuid: agentId },
      orderBy: { position: 'asc' },
    });
  }

  async replaceQuestions(ctx: Ctx, agentId: string, dto: ReplaceQuestionsDto) {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const existing = await this.prisma.agentQuestion.findMany({ where: { agent_uuid: agentId } });
    const byId = new Map(existing.map((q) => [q.id, q]));
    const seen = new Set<string>();

    for (const item of dto.items) {
      if (!item.id) continue;
      if (!byId.has(item.id)) throw new BadRequestException(`Unknown question id "${item.id}"`);
      if (seen.has(item.id)) throw new BadRequestException('Duplicate question in payload');
      seen.add(item.id);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.agentQuestion.deleteMany({
        where: { agent_uuid: agentId, id: { notIn: [...seen] } },
      });
      for (const [position, item] of dto.items.entries()) {
        const row = item.id ? byId.get(item.id) : undefined;
        const data = {
          question: item.question,
          is_required: item.is_required ?? row?.is_required ?? true,
          expected_answer: item.expected_answer ?? row?.expected_answer ?? null,
          position,
        };
        if (row) await tx.agentQuestion.update({ where: { id: row.id }, data });
        else await tx.agentQuestion.create({ data: { ...data, agent_uuid: agentId } });
      }
      await tx.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } });
    });

    await this.afterChange(ctx, agentId, 'questions');
    return this.prisma.agentQuestion.findMany({
      where: { agent_uuid: agentId },
      orderBy: { position: 'asc' },
    });
  }

  async replaceOutcomes(ctx: Ctx, agentId: string, dto: ReplaceOutcomesDto) {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const existing = await this.prisma.agentOutcome.findMany({ where: { agent_uuid: agentId } });
    const { plan, deleteIds } = planKeyedReplace(dto.items, existing);

    const resolved = plan.map((e) => ({
      ...e,
      system_type: (e.item.system_type ?? e.row?.system_type ?? null) as OutcomeSystemType | null,
    }));

    const systemTypes = resolved.map((e) => e.system_type).filter(Boolean);
    if (new Set(systemTypes).size !== systemTypes.length) {
      throw new BadRequestException('Each automatic outcome type can only be used once');
    }
    const missing = REQUIRED_SYSTEM_TYPES.filter((t) => !systemTypes.includes(t));
    if (missing.length) {
      throw new BadRequestException(
        `The automatic outcomes (Voicemail, Wrong Number, No Answer, Unknown) cannot be removed. Missing: ${missing.join(', ')}`,
      );
    }

    if (deleteIds.length) {
      const rules = await this.prisma.automationRule.count({
        where: { company_uuid: ctx.company_uuid, outcome_uuid: { in: deleteIds } },
      });
      if (rules > 0) {
        throw new ConflictException(
          'Some outcomes you are removing are used by automation rules. Update or delete those rules first.',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.agentOutcome.deleteMany({ where: { agent_uuid: agentId, id: { in: deleteIds } } });

      for (const e of resolved) {
        if (e.row && e.row.key !== e.key) {
          await tx.agentOutcome.update({ where: { id: e.row.id }, data: { key: `~${e.row.id}` } });
        }
      }

      for (const e of resolved) {
        const data = {
          key: e.key,
          label: e.item.label,
          description: e.item.description ?? e.row?.description ?? null,
          is_success: e.item.is_success ?? e.row?.is_success ?? false,
          system_type: e.system_type,
          position: e.position,
        };
        if (e.row) await tx.agentOutcome.update({ where: { id: e.row.id }, data });
        else await tx.agentOutcome.create({ data: { ...data, agent_uuid: agentId } });
      }
      await tx.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } });
    });

    await this.afterChange(ctx, agentId, 'outcomes');
    return this.listOutcomes(agentId);
  }

  async replaceTransferOutcomes(ctx: Ctx, agentId: string, dto: ReplaceTransferOutcomesDto) {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const ids = [...new Set(dto.outcome_uuids)];
    if (ids.length) {
      const count = await this.prisma.agentOutcome.count({
        where: { agent_uuid: agentId, id: { in: ids } },
      });
      if (count !== ids.length) throw new BadRequestException('Some outcomes do not belong to this agent');
    }

    await this.prisma.$transaction([
      this.prisma.agentTransferOutcome.deleteMany({ where: { agent_uuid: agentId } }),
      this.prisma.agentTransferOutcome.createMany({
        data: ids.map((outcome_uuid) => ({ agent_uuid: agentId, outcome_uuid })),
      }),
      this.prisma.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } }),
    ]);

    await this.afterChange(ctx, agentId, 'transfer_outcomes');
    return this.listOutcomes(agentId);
  }

  async getCrmTools(ctx: Ctx, agentId: string) {
    const agent = await this.agents.getAgentOrThrow(ctx, agentId);
    if (!agent.crm_integration_uuid) return { integration: null, data: [] };

    const integration = await this.prisma.integration.findFirst({
      where: { id: agent.crm_integration_uuid, company_uuid: ctx.company_uuid },
      select: { id: true, name: true, provider: true },
    });
    if (!integration) return { integration: null, data: [] };

    const [tools, allowed] = await Promise.all([
      this.prisma.crmTool.findMany({
        where: catalogueWhere(integration),
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        select: { id: true, key: true, name: true, description: true, category: true, input_schema: true },
      }),
      this.prisma.agentCrmTool.findMany({
        where: { agent_uuid: agentId },
        select: { crm_tool_uuid: true },
      }),
    ]);
    const allowedIds = new Set(allowed.map((a) => a.crm_tool_uuid));

    return {
      integration,
      data: tools.map((t) => ({ ...t, allowed: allowedIds.has(t.id) })),
    };
  }

  async replaceCrmTools(ctx: Ctx, agentId: string, dto: ReplaceCrmToolsDto) {
    const agent = await this.agents.getAgentOrThrow(ctx, agentId);
    const ids = [...new Set(dto.crm_tool_uuids)];

    if (ids.length) {
      if (!agent.crm_integration_uuid) {
        throw new BadRequestException('Connect a CRM to this agent before choosing tools');
      }
      const integration = await this.agents.assertCrmIntegration(ctx.company_uuid, agent.crm_integration_uuid);
      const valid = await this.prisma.crmTool.count({
        where: { id: { in: ids }, ...catalogueWhere(integration) },
      });
      if (valid !== ids.length) {
        throw new BadRequestException("Some tools are not available for this agent's CRM");
      }
    }

    await this.prisma.$transaction([
      this.prisma.agentCrmTool.deleteMany({ where: { agent_uuid: agentId } }),
      this.prisma.agentCrmTool.createMany({
        data: ids.map((crm_tool_uuid) => ({ agent_uuid: agentId, crm_tool_uuid })),
      }),
      this.prisma.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } }),
    ]);

    await this.afterChange(ctx, agentId, 'crm_tools');
    return this.getCrmTools(ctx, agentId);
  }

  async replaceKnowledgeSources(ctx: Ctx, agentId: string, dto: ReplaceKnowledgeSourcesDto) {
    await this.agents.getAgentOrThrow(ctx, agentId);
    const ids = [...new Set(dto.source_uuids)];

    if (ids.length) {
      const count = await this.prisma.knowledgeSource.count({
        where: { id: { in: ids }, company_uuid: ctx.company_uuid, deleted_at: null },
      });
      if (count !== ids.length) throw new BadRequestException('Some knowledge sources were not found');
    }

    await this.prisma.$transaction([
      this.prisma.agentKnowledgeSource.deleteMany({ where: { agent_uuid: agentId } }),
      this.prisma.agentKnowledgeSource.createMany({
        data: ids.map((source_uuid) => ({ agent_uuid: agentId, source_uuid })),
      }),
      this.prisma.agent.update({ where: { id: agentId }, data: { updated_at: new Date() } }),
    ]);

    await this.afterChange(ctx, agentId, 'knowledge_sources');

    const rows = await this.prisma.agentKnowledgeSource.findMany({
      where: { agent_uuid: agentId, source: { deleted_at: null } },
      include: { source: { select: { id: true, name: true, type: true, status: true, is_enabled: true } } },
    });
    return rows.map((r) => r.source);
  }

  private async listOutcomes(agentId: string) {
    const outcomes = await this.prisma.agentOutcome.findMany({
      where: { agent_uuid: agentId },
      orderBy: { position: 'asc' },
      include: { transfer_triggers: { where: { agent_uuid: agentId }, select: { agent_uuid: true } } },
    });
    return outcomes.map(({ transfer_triggers, ...o }) => ({
      ...o,
      triggers_transfer: transfer_triggers.length > 0,
    }));
  }

  private async afterChange(ctx: Ctx, agentId: string, section: string) {
    await this.activity.logFor(ctx, 'agent.updated', 'agent', agentId, { section });
    this.sync.scheduleIfNeeded(ctx.company_uuid, agentId);
  }
}
