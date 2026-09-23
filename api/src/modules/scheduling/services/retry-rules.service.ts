import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RetryTrigger } from 'generated/prisma';
import { IANAZone } from 'luxon';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import { UpsertRetryRuleDto } from '../dto/upsert-retry-rule.dto';

const DEFAULTS = {
  is_enabled: false,
  max_attempts: 3,
  delays_minutes: [120, 1440],
  retry_on: [RetryTrigger.NO_ANSWER, RetryTrigger.BUSY, RetryTrigger.FAILED],
  calling_hours_override: null,
};

@Injectable()
export class RetryRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentAccess: AgentAccessService,
    private readonly activity: ActivityLogService,
  ) {}

  async get(ctx: CompanyContextData, agentUuid: string) {
    await this.assertAgent(ctx, agentUuid);
    const rule = await this.prisma.retryRule.findUnique({ where: { agent_uuid: agentUuid } });
    if (rule) return { ...rule, configured: true };
    // No rule stored means retries are off until the business opts in.
    return { id: null, agent_uuid: agentUuid, ...DEFAULTS, configured: false };
  }

  async upsert(ctx: CompanyContextData, agentUuid: string, dto: UpsertRetryRuleDto) {
    await this.assertAgent(ctx, agentUuid);
    this.validateOverride(dto);

    const existing = await this.prisma.retryRule.findUnique({ where: { agent_uuid: agentUuid } });
    const base = existing ?? { ...DEFAULTS, is_enabled: true };

    const data = {
      is_enabled: dto.is_enabled ?? base.is_enabled,
      max_attempts: dto.max_attempts ?? base.max_attempts,
      delays_minutes: dto.delays_minutes ?? base.delays_minutes,
      retry_on: dto.retry_on?.length ? [...new Set(dto.retry_on)] : base.retry_on,
    };
    if (data.retry_on.length === 0) throw new BadRequestException('retry_on cannot be empty');

    const override =
      dto.calling_hours_override === undefined
        ? undefined
        : dto.calling_hours_override === null
          ? Prisma.DbNull
          : (dto.calling_hours_override as unknown as Prisma.InputJsonValue);

    const rule = await this.prisma.retryRule.upsert({
      where: { agent_uuid: agentUuid },
      create: { agent_uuid: agentUuid, ...data, calling_hours_override: override },
      update: { ...data, calling_hours_override: override },
    });

    await this.activity.logFor(ctx, 'retry_rule.updated', 'agent', agentUuid, {
      is_enabled: rule.is_enabled,
      max_attempts: rule.max_attempts,
    });
    return { ...rule, configured: true };
  }

  private async assertAgent(ctx: CompanyContextData, agentUuid: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentUuid, company_uuid: ctx.company_uuid, deleted_at: null },
      select: { id: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    await this.agentAccess.assertAgentAccess(ctx, agentUuid);
  }

  private validateOverride(dto: UpsertRetryRuleDto) {
    const override = dto.calling_hours_override;
    if (!override) return;

    if (override.timezone && !IANAZone.isValidZone(override.timezone)) {
      throw new BadRequestException('Invalid timezone in calling_hours_override');
    }
    const seen = new Set<number>();
    for (const day of override.days) {
      if (seen.has(day.day_of_week)) {
        throw new BadRequestException('Duplicate day_of_week in calling_hours_override');
      }
      seen.add(day.day_of_week);
      if (day.is_enabled && day.end_time <= day.start_time) {
        throw new BadRequestException('end_time must be after start_time');
      }
    }
  }
}
