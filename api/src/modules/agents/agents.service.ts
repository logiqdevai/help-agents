import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  Agent,
  AgentStatus,
  AlertStatus,
  IntegrationCategory,
  PhoneNumberStatus,
  Prisma,
  ScheduledCallStatus,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { CallStatsService } from '@/modules/dashboard/call-stats.service';
import { previousPeriod, resolvePeriod } from '@/modules/dashboard/utils/period.utils';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentQueryType } from './dto/agent-query.schema';
import { AgentSyncService } from './services/agent-sync.service';
import { AgentListItem, AgentOverview, AgentReadiness } from './interfaces/agent.interface';
import {
  catalogueWhere,
  computeReadiness,
  DEFAULT_OUTCOMES,
  FINAL_CALL_STATUSES,
  normalizeTransferNumber,
} from './utils/agent.utils';

type Ctx = CompanyContextData;

const CRM_SELECT = { id: true, name: true, provider: true, status: true } as const;

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentAccess: AgentAccessService,
    private readonly activity: ActivityLogService,
    private readonly sync: AgentSyncService,
    private readonly voiceProvider: VoiceProviderService,
    private readonly callStats: CallStatsService,
  ) {}

  /** Loads a non-deleted agent of the caller's company and enforces MEMBER agent grants. */
  async getAgentOrThrow(ctx: Ctx, id: string): Promise<Agent> {
    const agent = await this.prisma.agent.findFirst({
      where: { id, company_uuid: ctx.company_uuid, deleted_at: null },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    await this.agentAccess.assertAgentAccess(ctx, id);
    return agent;
  }

  async assertCrmIntegration(companyUuid: string, integrationUuid: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationUuid, company_uuid: companyUuid, category: IntegrationCategory.CRM },
      select: { id: true, provider: true },
    });
    if (!integration) throw new BadRequestException('CRM connection not found');
    return integration;
  }

  async list(ctx: Ctx, query: AgentQueryType) {
    const accessible = await this.agentAccess.getAccessibleAgentIds(ctx);

    const where: Prisma.AgentWhereInput = {
      company_uuid: ctx.company_uuid,
      deleted_at: null,
      ...(accessible !== null ? { id: { in: accessible } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.crm_integration_uuid ? { crm_integration_uuid: query.crm_integration_uuid } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        ...skipTake({ page: query.page, limit: query.limit }),
        orderBy: { [query.order_by]: query.order_direction },
        select: {
          id: true,
          name: true,
          description: true,
          purpose: true,
          status: true,
          language: true,
          voice: true,
          created_at: true,
          updated_at: true,
          crm_integration: { select: CRM_SELECT },
          phone_numbers: {
            where: { status: { not: PhoneNumberStatus.RELEASED } },
            select: { id: true, number: true },
          },
          _count: {
            select: { knowledge_sources: { where: { source: { deleted_at: null } } } },
          },
        },
      }),
      this.prisma.agent.count({ where }),
    ]);

    const stats = await this.listCallStats(ctx.company_uuid, agents.map((a) => a.id));

    const data: AgentListItem[] = agents.map((a) => {
      const s = stats.get(a.id);
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        purpose: a.purpose,
        status: a.status,
        language: a.language,
        voice: a.voice,
        crm_integration: a.crm_integration,
        phone_numbers: a.phone_numbers,
        knowledge_sources_count: a._count.knowledge_sources,
        calls_made: s?.calls_made ?? 0,
        success_rate: s?.success_rate ?? null,
        last_call_at: s?.last_call_at ?? null,
        created_at: a.created_at,
        updated_at: a.updated_at,
      };
    });

    return paginated(data, total, query.page, query.limit);
  }

  async create(ctx: Ctx, dto: CreateAgentDto) {
    const { crm_integration_uuid, transfer_number, personalization_config, ...rest } = dto;

    if (crm_integration_uuid) await this.assertCrmIntegration(ctx.company_uuid, crm_integration_uuid);
    const normalizedTransfer = normalizeTransferNumber(transfer_number);

    const agent = await this.prisma.agent.create({
      data: {
        ...rest,
        company_uuid: ctx.company_uuid,
        created_by_uuid: ctx.user_uuid,
        status: AgentStatus.DRAFT,
        crm_integration_uuid: crm_integration_uuid ?? null,
        transfer_number: normalizedTransfer ?? null,
        personalization_config: personalization_config
          ? (personalization_config as Prisma.InputJsonValue)
          : undefined,
        outcomes: {
          create: DEFAULT_OUTCOMES.map((o, position) => ({ ...o, position })),
        },
      },
    });

    await this.activity.logFor(ctx, 'agent.created', 'agent', agent.id, { name: agent.name });
    return this.findOne(ctx, agent.id);
  }

  async findOne(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);

    const agent = await this.prisma.agent.findFirst({
      where: { id, company_uuid: ctx.company_uuid, deleted_at: null },
      include: {
        goal_items: { orderBy: { position: 'asc' } },
        questions: { orderBy: { position: 'asc' } },
        outcomes: {
          orderBy: { position: 'asc' },
          include: { transfer_triggers: { where: { agent_uuid: id }, select: { agent_uuid: true } } },
        },
        crm_tools: {
          include: {
            crm_tool: {
              select: { id: true, key: true, name: true, description: true, category: true },
            },
          },
        },
        knowledge_sources: {
          where: { source: { deleted_at: null } },
          include: {
            source: { select: { id: true, name: true, type: true, status: true, is_enabled: true } },
          },
        },
        crm_integration: { select: CRM_SELECT },
        _count: { select: { access: true } },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const { goal_items, questions, outcomes, crm_tools, knowledge_sources, _count, ...scalars } = agent;

    return {
      ...scalars,
      goal_items,
      questions,
      outcomes: outcomes.map(({ transfer_triggers, ...o }) => ({
        ...o,
        triggers_transfer: transfer_triggers.length > 0,
      })),
      crm_tools: crm_tools.map((t) => t.crm_tool),
      knowledge_sources: knowledge_sources.map((k) => k.source),
      access_grants_count: _count.access,
    };
  }

  async update(ctx: Ctx, id: string, dto: UpdateAgentDto) {
    const agent = await this.getAgentOrThrow(ctx, id);
    const { crm_integration_uuid, transfer_number, personalization_config, ...rest } = dto;

    const data: Prisma.AgentUncheckedUpdateInput = { ...rest };

    const transfer = normalizeTransferNumber(transfer_number);
    if (transfer !== undefined) data.transfer_number = transfer;

    if (personalization_config !== undefined) {
      data.personalization_config =
        personalization_config === null ? Prisma.DbNull : (personalization_config as Prisma.InputJsonValue);
    }

    let integrationChange: { id: string; provider: any } | null | undefined;
    if (crm_integration_uuid !== undefined && crm_integration_uuid !== agent.crm_integration_uuid) {
      integrationChange = crm_integration_uuid
        ? await this.assertCrmIntegration(ctx.company_uuid, crm_integration_uuid)
        : null;
      data.crm_integration_uuid = crm_integration_uuid ?? null;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.agent.update({ where: { id }, data });
      if (integrationChange !== undefined) {
        await tx.agentCrmTool.deleteMany({
          where: {
            agent_uuid: id,
            ...(integrationChange ? { crm_tool: { NOT: catalogueWhere(integrationChange) } } : {}),
          },
        });
      }
    });

    await this.activity.logFor(ctx, 'agent.updated', 'agent', id, { fields: Object.keys(dto) });
    this.sync.scheduleIfNeeded(ctx.company_uuid, id);
    return this.findOne(ctx, id);
  }

  async remove(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);

    const numbers = await this.prisma.phoneNumber.findMany({
      where: { agent_uuid: id, company_uuid: ctx.company_uuid },
      select: { number: true },
    });

    await this.prisma.$transaction([
      this.prisma.agent.update({
        where: { id },
        data: { deleted_at: new Date(), status: AgentStatus.INACTIVE },
      }),
      this.prisma.phoneNumber.updateMany({
        where: { agent_uuid: id, company_uuid: ctx.company_uuid },
        data: { agent_uuid: null },
      }),
      this.prisma.scheduledCall.updateMany({
        where: { agent_uuid: id, company_uuid: ctx.company_uuid, status: ScheduledCallStatus.PENDING },
        data: { status: ScheduledCallStatus.CANCELED, closed_reason: 'agent_deleted' },
      }),
    ]);

    setImmediate(async () => {
      for (const { number } of numbers) {
        try {
          await this.voiceProvider.bindPhoneNumber(number, null);
        } catch (error) {
          this.logger.error(`Failed to unbind number from deleted agent ${id}: ${error?.message}`);
        }
      }
      try {
        await this.voiceProvider.deleteAgent(id);
      } catch (error) {
        this.logger.error(`Failed to remove provider agent ${id}: ${error?.message}`);
      }
    });

    await this.activity.logFor(ctx, 'agent.deleted', 'agent', id);
    return { message: 'Agent deleted' };
  }

  async duplicate(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);

    const src = await this.prisma.agent.findFirst({
      where: { id, company_uuid: ctx.company_uuid, deleted_at: null },
      include: {
        goal_items: true,
        questions: true,
        outcomes: { include: { transfer_triggers: true } },
        crm_tools: true,
        knowledge_sources: { where: { source: { deleted_at: null } } },
      },
    });
    if (!src) throw new NotFoundException('Agent not found');

    const copyId = await this.prisma.$transaction(async (tx) => {
      const copy = await tx.agent.create({
        data: {
          company_uuid: ctx.company_uuid,
          created_by_uuid: ctx.user_uuid,
          name: `${src.name.slice(0, 112)} (copy)`,
          description: src.description,
          purpose: src.purpose,
          status: AgentStatus.DRAFT,
          voice: src.voice,
          language: src.language,
          first_message: src.first_message,
          instructions: src.instructions,
          goal: src.goal,
          success_criteria: src.success_criteria,
          failure_criteria: src.failure_criteria,
          max_call_duration_seconds: src.max_call_duration_seconds,
          crm_integration_uuid: src.crm_integration_uuid,
          personalization_config: src.personalization_config
            ? (src.personalization_config as Prisma.InputJsonValue)
            : undefined,
          detect_voicemail: src.detect_voicemail,
          leave_voicemail: src.leave_voicemail,
          voicemail_message: src.voicemail_message,
          transfer_enabled: src.transfer_enabled,
          transfer_on_request: src.transfer_on_request,
          transfer_on_unresolved: src.transfer_on_unresolved,
          transfer_number: src.transfer_number,
          transfer_fallback_message: src.transfer_fallback_message,
        },
      });

      if (src.goal_items.length) {
        await tx.agentGoalItem.createMany({
          data: src.goal_items.map((g) => ({
            agent_uuid: copy.id,
            key: g.key,
            label: g.label,
            description: g.description,
            requirement: g.requirement,
            data_type: g.data_type,
            enum_values: g.enum_values,
            position: g.position,
          })),
        });
      }

      if (src.questions.length) {
        await tx.agentQuestion.createMany({
          data: src.questions.map((q) => ({
            agent_uuid: copy.id,
            question: q.question,
            is_required: q.is_required,
            expected_answer: q.expected_answer,
            position: q.position,
          })),
        });
      }

      const outcomeIds = new Map<string, string>();
      for (const o of src.outcomes) {
        const created = await tx.agentOutcome.create({
          data: {
            agent_uuid: copy.id,
            key: o.key,
            label: o.label,
            description: o.description,
            is_success: o.is_success,
            system_type: o.system_type,
            position: o.position,
          },
        });
        outcomeIds.set(o.id, created.id);
      }

      const transfers = src.outcomes
        .filter((o) => o.transfer_triggers.some((t) => t.agent_uuid === id))
        .map((o) => ({ agent_uuid: copy.id, outcome_uuid: outcomeIds.get(o.id) }));
      if (transfers.length) await tx.agentTransferOutcome.createMany({ data: transfers });

      if (src.crm_tools.length) {
        await tx.agentCrmTool.createMany({
          data: src.crm_tools.map((t) => ({ agent_uuid: copy.id, crm_tool_uuid: t.crm_tool_uuid })),
        });
      }
      if (src.knowledge_sources.length) {
        await tx.agentKnowledgeSource.createMany({
          data: src.knowledge_sources.map((k) => ({ agent_uuid: copy.id, source_uuid: k.source_uuid })),
        });
      }
      return copy.id;
    });

    await this.activity.logFor(ctx, 'agent.duplicated', 'agent', copyId, { source_agent_uuid: id });
    return this.findOne(ctx, copyId);
  }

  async getReadiness(ctx: Ctx, id: string): Promise<AgentReadiness> {
    await this.getAgentOrThrow(ctx, id);
    return this.loadReadiness(ctx.company_uuid, id);
  }

  async activate(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);

    const readiness = await this.loadReadiness(ctx.company_uuid, id);
    if (!readiness.is_ready) {
      throw new BadRequestException({
        code: 'AGENT_NOT_READY',
        message: 'The agent is not ready to be activated.',
        blockers: readiness.blockers,
      });
    }

    const synced = await this.sync.syncNow(ctx.company_uuid, id);
    if (!synced) {
      throw new ServiceUnavailableException(
        'The agent could not be prepared right now. Please try again shortly.',
      );
    }

    await this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.ACTIVE, activated_at: new Date() },
    });
    await this.activity.logFor(ctx, 'agent.activated', 'agent', id);
    return this.findOne(ctx, id);
  }

  async deactivate(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);
    await this.prisma.agent.update({ where: { id }, data: { status: AgentStatus.INACTIVE } });
    await this.activity.logFor(ctx, 'agent.deactivated', 'agent', id);
    return this.findOne(ctx, id);
  }

  async resync(ctx: Ctx, id: string) {
    await this.getAgentOrThrow(ctx, id);
    const is_ready = await this.sync.syncNow(ctx.company_uuid, id);
    return { is_ready };
  }

  async overview(ctx: Ctx, id: string): Promise<AgentOverview> {
    await this.getAgentOrThrow(ctx, id);

    const agent = await this.prisma.agent.findFirst({
      where: { id, company_uuid: ctx.company_uuid, deleted_at: null },
      select: {
        id: true,
        name: true,
        status: true,
        goal: true,
        voice: true,
        language: true,
        activated_at: true,
        crm_integration: { select: CRM_SELECT },
        phone_numbers: {
          where: { status: { not: PhoneNumberStatus.RELEASED } },
          select: { id: true, number: true },
        },
        _count: { select: { knowledge_sources: { where: { source: { deleted_at: null } } } } },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const base = { company_uuid: ctx.company_uuid, agent_uuid: id, is_test: false };
    const finalWhere: Prisma.CallWhereInput = { ...base, status: { in: FINAL_CALL_STATUSES } };

    const company = await this.prisma.company.findUnique({
      where: { id: ctx.company_uuid },
      select: { timezone: true },
    });
    const today = resolvePeriod({ period: 'today' }, company?.timezone);
    const scope = { company_uuid: ctx.company_uuid, accessible_agent_ids: null, agent_uuid: id };
    const monthWhere = this.callStats.buildWhere(scope, resolvePeriod({ period: '30d' }, company?.timezone));

    const [
      callsMade,
      finalCount,
      successCount,
      averages,
      lastCall,
      unresolved,
      readiness,
      callsToday,
      callsYesterday,
      monthTotals,
      monthOutcomes,
    ] = await Promise.all([
        this.prisma.call.count({ where: base }),
        this.prisma.call.count({ where: finalWhere }),
        this.prisma.call.count({ where: { ...finalWhere, is_successful: true } }),
        this.prisma.call.aggregate({
          where: finalWhere,
          _avg: { duration_seconds: true, total_cost: true },
        }),
        this.prisma.call.findFirst({
          where: base,
          orderBy: { created_at: 'desc' },
          select: { created_at: true, currency: true },
        }),
        this.prisma.alert.count({
          where: {
            company_uuid: ctx.company_uuid,
            entity_type: 'agent',
            entity_uuid: id,
            status: AlertStatus.OPEN,
          },
        }),
        this.loadReadiness(ctx.company_uuid, id),
        this.prisma.call.count({ where: this.callStats.buildWhere(scope, today) }),
        this.prisma.call.count({ where: this.callStats.buildWhere(scope, previousPeriod(today)) }),
        this.callStats.totals(monthWhere),
        this.callStats.outcomeBreakdown(monthWhere),
      ]);

    const avgCost = averages._avg.total_cost;

    return {
      id: agent.id,
      name: agent.name,
      status: agent.status,
      goal: agent.goal,
      knowledge_sources_count: agent._count.knowledge_sources,
      crm_integration: agent.crm_integration,
      phone_numbers: agent.phone_numbers,
      voice: agent.voice,
      language: agent.language,
      calls_made: callsMade,
      success_rate: finalCount ? Math.round((successCount / finalCount) * 100) : null,
      average_duration_seconds:
        averages._avg.duration_seconds !== null ? Math.round(averages._avg.duration_seconds) : null,
      average_cost: avgCost !== null && avgCost !== undefined ? Number(avgCost) : null,
      currency: lastCall?.currency ?? 'EUR',
      last_call_at: lastCall?.created_at ?? null,
      activated_at: agent.activated_at,
      calls_today: callsToday,
      calls_yesterday: callsYesterday,
      last_30_days: {
        total_calls: monthTotals.total_calls,
        successful_calls: monthTotals.successful_calls,
        success_rate: monthTotals.total_calls
          ? Math.round((monthTotals.successful_calls / monthTotals.total_calls) * 100)
          : null,
      },
      outcomes_30_days: monthOutcomes,
      readiness,
      unresolved_alerts: unresolved,
    };
  }

  private async loadReadiness(companyUuid: string, id: string): Promise<AgentReadiness> {
    const agent = await this.prisma.agent.findFirst({
      where: { id, company_uuid: companyUuid, deleted_at: null },
      select: {
        name: true,
        instructions: true,
        language: true,
        transfer_enabled: true,
        transfer_number: true,
        status: true,
        crm_integration: { select: { status: true } },
        _count: { select: { outcomes: true } },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const [phones, knowledge, tests] = await Promise.all([
      this.prisma.phoneNumber.count({
        where: { agent_uuid: id, company_uuid: companyUuid, status: PhoneNumberStatus.ACTIVE },
      }),
      this.prisma.agentKnowledgeSource.count({
        where: { agent_uuid: id, source: { deleted_at: null } },
      }),
      this.prisma.call.count({ where: { agent_uuid: id, company_uuid: companyUuid, is_test: true } }),
    ]);

    return computeReadiness({
      agent,
      outcomes_count: agent._count.outcomes,
      active_phone_numbers: phones,
      knowledge_sources: knowledge,
      test_calls: tests,
    });
  }

  private async listCallStats(companyUuid: string, agentIds: string[]) {
    const stats = new Map<
      string,
      { calls_made: number; success_rate: number | null; last_call_at: Date | null }
    >();
    if (!agentIds.length) return stats;

    const [made, final] = await Promise.all([
      this.prisma.call.groupBy({
        by: ['agent_uuid'],
        where: { company_uuid: companyUuid, agent_uuid: { in: agentIds }, is_test: false },
        _count: { _all: true },
        _max: { created_at: true },
      }),
      this.prisma.call.groupBy({
        by: ['agent_uuid', 'is_successful'],
        where: {
          company_uuid: companyUuid,
          agent_uuid: { in: agentIds },
          is_test: false,
          status: { in: FINAL_CALL_STATUSES },
        },
        _count: { _all: true },
      }),
    ]);

    for (const id of agentIds) stats.set(id, { calls_made: 0, success_rate: null, last_call_at: null });
    for (const row of made) {
      const entry = stats.get(row.agent_uuid);
      entry.calls_made = row._count._all;
      entry.last_call_at = row._max.created_at;
    }

    const totals = new Map<string, { total: number; success: number }>();
    for (const row of final) {
      const t = totals.get(row.agent_uuid) ?? { total: 0, success: 0 };
      t.total += row._count._all;
      if (row.is_successful) t.success += row._count._all;
      totals.set(row.agent_uuid, t);
    }
    for (const [agentId, t] of totals) {
      stats.get(agentId).success_rate = t.total ? Math.round((t.success / t.total) * 100) : null;
    }
    return stats;
  }
}
