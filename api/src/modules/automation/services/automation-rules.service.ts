import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AutomationActionType, AutomationTrigger, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { AutomationActionDto, CreateAutomationRuleDto } from '../dto/create-automation-rule.dto';
import { UpdateAutomationRuleDto } from '../dto/update-automation-rule.dto';
import { AutomationRuleQueryType } from '../dto/automation-rule-query.schema';
import { validateActionConfig, validateConditions } from '../utils/action-config.utils';

const INCLUDE = {
  actions: { orderBy: { position: 'asc' } },
} satisfies Prisma.AutomationRuleInclude;

@Injectable()
export class AutomationRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentAccess: AgentAccessService,
    private readonly activity: ActivityLogService,
  ) {}

  async create(ctx: CompanyContextData, dto: CreateAutomationRuleDto) {
    await this.validateScope(ctx, dto.trigger, dto.agent_uuid ?? null, dto.outcome_uuid ?? null);
    const conditions = validateConditions(dto.conditions);
    const actions = await this.prepareActions(ctx.company_uuid, dto.actions);

    const rule = await this.prisma.automationRule.create({
      data: {
        company_uuid: ctx.company_uuid,
        agent_uuid: dto.agent_uuid ?? null,
        outcome_uuid: dto.outcome_uuid ?? null,
        name: dto.name,
        trigger: dto.trigger,
        conditions: this.jsonOrNull(conditions),
        is_enabled: dto.is_enabled ?? true,
        position: dto.position ?? 0,
        actions: { create: actions },
      },
      include: INCLUDE,
    });

    await this.activity.logFor(ctx, 'automation_rule.created', 'automation_rule', rule.id, {
      name: rule.name,
      trigger: rule.trigger,
    });
    return rule;
  }

  async findAll(ctx: CompanyContextData, query: AutomationRuleQueryType) {
    const accessible = await this.agentAccess.getAccessibleAgentIds(ctx);
    const where: Prisma.AutomationRuleWhereInput = {
      company_uuid: ctx.company_uuid,
      ...(query.trigger && { trigger: query.trigger }),
      ...(query.is_enabled !== undefined && { is_enabled: query.is_enabled }),
      ...(query.agent_uuid && { agent_uuid: query.agent_uuid }),
      ...(accessible !== null && { OR: [{ agent_uuid: null }, { agent_uuid: { in: accessible } }] }),
    };

    const [items, count] = await Promise.all([
      this.prisma.automationRule.findMany({
        where,
        include: INCLUDE,
        orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
        ...skipTake({ page: query.page, limit: query.limit }),
      }),
      this.prisma.automationRule.count({ where }),
    ]);
    return paginated(items, count, query.page, query.limit);
  }

  async findOne(ctx: CompanyContextData, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, company_uuid: ctx.company_uuid },
      include: INCLUDE,
    });
    if (!rule) throw new NotFoundException('Automation rule not found');
    if (rule.agent_uuid) await this.agentAccess.assertAgentAccess(ctx, rule.agent_uuid);
    return rule;
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdateAutomationRuleDto) {
    const existing = await this.findOne(ctx, id);

    const trigger = dto.trigger ?? existing.trigger;
    const agentUuid = dto.agent_uuid === undefined ? existing.agent_uuid : dto.agent_uuid;
    const outcomeUuid = dto.outcome_uuid === undefined ? existing.outcome_uuid : dto.outcome_uuid;
    await this.validateScope(ctx, trigger, agentUuid, outcomeUuid);

    const conditions = dto.conditions === undefined ? undefined : validateConditions(dto.conditions);
    const actions = dto.actions ? await this.prepareActions(ctx.company_uuid, dto.actions) : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.automationRule.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          trigger,
          agent_uuid: agentUuid,
          outcome_uuid: outcomeUuid,
          ...(conditions !== undefined && { conditions: this.jsonOrNull(conditions) }),
          ...(dto.is_enabled !== undefined && { is_enabled: dto.is_enabled }),
          ...(dto.position !== undefined && { position: dto.position }),
        },
      });
      if (actions) {
        await tx.automationAction.deleteMany({ where: { rule_uuid: id } });
        await tx.automationAction.createMany({ data: actions.map((a) => ({ ...a, rule_uuid: id })) });
      }
    });

    await this.activity.logFor(ctx, 'automation_rule.updated', 'automation_rule', id);
    return this.findOne(ctx, id);
  }

  async setEnabled(ctx: CompanyContextData, id: string, isEnabled: boolean) {
    await this.findOne(ctx, id);
    await this.prisma.automationRule.updateMany({
      where: { id, company_uuid: ctx.company_uuid },
      data: { is_enabled: isEnabled },
    });
    await this.activity.logFor(
      ctx,
      isEnabled ? 'automation_rule.enabled' : 'automation_rule.disabled',
      'automation_rule',
      id,
    );
    return this.findOne(ctx, id);
  }

  async remove(ctx: CompanyContextData, id: string) {
    const rule = await this.findOne(ctx, id);
    await this.prisma.automationRule.deleteMany({ where: { id, company_uuid: ctx.company_uuid } });
    await this.activity.logFor(ctx, 'automation_rule.deleted', 'automation_rule', id, { name: rule.name });
    return { message: 'Automation rule deleted' };
  }

  private jsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
    return value ? (value as Prisma.InputJsonValue) : Prisma.DbNull;
  }

  private async validateScope(
    ctx: CompanyContextData,
    trigger: AutomationTrigger,
    agentUuid: string | null,
    outcomeUuid: string | null,
  ) {
    if (agentUuid) {
      const agent = await this.prisma.agent.findFirst({
        where: { id: agentUuid, company_uuid: ctx.company_uuid, deleted_at: null },
        select: { id: true },
      });
      if (!agent) throw new NotFoundException('Agent not found');
      await this.agentAccess.assertAgentAccess(ctx, agentUuid);
    } else {
      // Restricted members cannot manage company-wide rules.
      const accessible = await this.agentAccess.getAccessibleAgentIds(ctx);
      if (accessible !== null) throw new BadRequestException('Select an agent for this rule');
    }

    if (outcomeUuid) {
      if (trigger !== AutomationTrigger.CALL_OUTCOME) {
        throw new BadRequestException('outcome_uuid can only be used with the CALL_OUTCOME trigger');
      }
      if (!agentUuid) throw new BadRequestException('outcome_uuid requires agent_uuid');
      const outcome = await this.prisma.agentOutcome.findFirst({
        where: { id: outcomeUuid, agent_uuid: agentUuid, agent: { company_uuid: ctx.company_uuid } },
        select: { id: true },
      });
      if (!outcome) throw new NotFoundException('Outcome not found for this agent');
    }
  }

  private async prepareActions(companyUuid: string, actions: AutomationActionDto[]) {
    const prepared: Prisma.AutomationActionCreateWithoutRuleInput[] = [];

    for (const [index, action] of actions.entries()) {
      const config = validateActionConfig(action.type, action.config);

      if (action.type === AutomationActionType.SCHEDULE_FOLLOW_UP && config.agent_uuid) {
        const agent = await this.prisma.agent.findFirst({
          where: { id: config.agent_uuid, company_uuid: companyUuid, deleted_at: null },
          select: { id: true },
        });
        if (!agent) throw new NotFoundException('Follow-up agent not found');
      }

      prepared.push({
        type: action.type,
        config: config as Prisma.InputJsonValue,
        delay_minutes: action.delay_minutes ?? 0,
        position: action.position ?? index,
      });
    }
    return prepared;
  }
}
