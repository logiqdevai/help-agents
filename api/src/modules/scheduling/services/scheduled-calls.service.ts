import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AgentStatus, Prisma, ScheduledCallSource, ScheduledCallStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AgentAccessService } from '@/shared/services/agent-access/agent-access.service';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { CallingHoursService } from '@/modules/call-engine/services/calling-hours.service';
import { CallPlacementErrorCodes } from '@/modules/call-engine/call-engine.constants';
import { CreateScheduledCallDto, ScheduleWhenDto } from '../dto/create-scheduled-call.dto';
import { UpdateScheduledCallDto } from '../dto/update-scheduled-call.dto';
import { CancelForContactDto } from '../dto/cancel-for-contact.dto';
import { ScheduledCallQueryType } from '../dto/scheduled-call-query.schema';
import { resolveRequestedTime } from '../utils/scheduling.utils';

const INCLUDE = {
  agent: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.ScheduledCallInclude;

@Injectable()
export class ScheduledCallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly callingHours: CallingHoursService,
    private readonly agentAccess: AgentAccessService,
    private readonly activity: ActivityLogService,
  ) {}

  async create(ctx: CompanyContextData, dto: CreateScheduledCallDto) {
    if (!!dto.contact_uuid === !!dto.contact) {
      throw new BadRequestException('Provide either contact_uuid or contact');
    }

    await this.agentAccess.assertAgentAccess(ctx, dto.agent_uuid);

    const agent = await this.prisma.agent.findFirst({
      where: { id: dto.agent_uuid, company_uuid: ctx.company_uuid, deleted_at: null },
      select: { id: true, status: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    if (agent.status !== AgentStatus.ACTIVE) {
      throw new BadRequestException({
        code: CallPlacementErrorCodes.AGENT_NOT_ACTIVE,
        message: 'Agent must be active to schedule calls',
      });
    }

    const contact = await this.resolveContact(ctx.company_uuid, dto);
    const scheduledFor = await this.computeTime(ctx.company_uuid, dto.when);

    const created = await this.prisma.scheduledCall.create({
      data: {
        company_uuid: ctx.company_uuid,
        agent_uuid: agent.id,
        contact_uuid: contact.id,
        source: ScheduledCallSource.MANUAL,
        status: ScheduledCallStatus.PENDING,
        scheduled_for: scheduledFor,
      },
      include: INCLUDE,
    });

    await this.activity.logFor(ctx, 'scheduled_call.created', 'scheduled_call', created.id, {
      agent_uuid: agent.id,
      contact_uuid: contact.id,
      scheduled_for: scheduledFor.toISOString(),
    });
    return created;
  }

  async findAll(ctx: CompanyContextData, query: ScheduledCallQueryType) {
    const scope = await this.agentAccess.agentScope(ctx);
    const where: Prisma.ScheduledCallWhereInput = {
      company_uuid: ctx.company_uuid,
      ...scope,
      ...(query.status && { status: query.status }),
      ...(query.source && { source: query.source }),
      ...(query.contact_uuid && { contact_uuid: query.contact_uuid }),
      ...(query.from || query.to
        ? { scheduled_for: { ...(query.from && { gte: query.from }), ...(query.to && { lte: query.to }) } }
        : {}),
    };
    if (query.agent_uuid) {
      where.agent_uuid = scope.agent_uuid
        ? { in: (scope.agent_uuid.in as string[]).filter((id) => id === query.agent_uuid) }
        : query.agent_uuid;
    }

    const [items, count] = await Promise.all([
      this.prisma.scheduledCall.findMany({
        where,
        include: INCLUDE,
        orderBy: { scheduled_for: query.order_direction },
        ...skipTake({ page: query.page, limit: query.limit }),
      }),
      this.prisma.scheduledCall.count({ where }),
    ]);
    return paginated(items, count, query.page, query.limit);
  }

  async findOne(ctx: CompanyContextData, id: string) {
    const item = await this.prisma.scheduledCall.findFirst({
      where: { id, company_uuid: ctx.company_uuid },
      include: { ...INCLUDE, call: { select: { id: true, call_number: true, status: true } } },
    });
    if (!item) throw new NotFoundException('Scheduled call not found');
    await this.agentAccess.assertAgentAccess(ctx, item.agent_uuid);
    return item;
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdateScheduledCallDto) {
    const existing = await this.findOne(ctx, id);
    if (existing.status !== ScheduledCallStatus.PENDING) {
      throw new BadRequestException('Only pending scheduled calls can be rescheduled');
    }
    if (!dto.when) throw new BadRequestException('`when` is required');

    const scheduledFor = await this.computeTime(ctx.company_uuid, dto.when);
    const result = await this.prisma.scheduledCall.updateMany({
      where: { id, company_uuid: ctx.company_uuid, status: ScheduledCallStatus.PENDING },
      data: { scheduled_for: scheduledFor },
    });
    if (result.count === 0) throw new BadRequestException('Scheduled call is no longer pending');

    await this.activity.logFor(ctx, 'scheduled_call.rescheduled', 'scheduled_call', id, {
      scheduled_for: scheduledFor.toISOString(),
    });
    return this.findOne(ctx, id);
  }

  async cancel(ctx: CompanyContextData, id: string) {
    const existing = await this.findOne(ctx, id);
    if (existing.status !== ScheduledCallStatus.PENDING) {
      throw new BadRequestException('Only pending scheduled calls can be canceled');
    }

    const result = await this.prisma.scheduledCall.updateMany({
      where: { id, company_uuid: ctx.company_uuid, status: ScheduledCallStatus.PENDING },
      data: { status: ScheduledCallStatus.CANCELED, closed_reason: 'Canceled by user' },
    });
    if (result.count === 0) throw new BadRequestException('Scheduled call is no longer pending');

    await this.activity.logFor(ctx, 'scheduled_call.canceled', 'scheduled_call', id);
    return { message: 'Scheduled call canceled' };
  }

  async cancelForContact(ctx: CompanyContextData, dto: CancelForContactDto) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: dto.contact_uuid, company_uuid: ctx.company_uuid },
      select: { id: true },
    });
    if (!contact) throw new NotFoundException('Contact not found');

    if (dto.agent_uuid) await this.agentAccess.assertAgentAccess(ctx, dto.agent_uuid);
    const scope = await this.agentAccess.agentScope(ctx);

    const result = await this.prisma.scheduledCall.updateMany({
      where: {
        company_uuid: ctx.company_uuid,
        contact_uuid: contact.id,
        status: ScheduledCallStatus.PENDING,
        ...scope,
        ...(dto.agent_uuid && { agent_uuid: dto.agent_uuid }),
      },
      data: { status: ScheduledCallStatus.CANCELED, closed_reason: 'Canceled by user' },
    });

    if (result.count > 0) {
      await this.activity.logFor(ctx, 'scheduled_call.canceled', 'contact', contact.id, {
        canceled: result.count,
      });
    }
    return { canceled: result.count };
  }

  private async resolveContact(companyUuid: string, dto: CreateScheduledCallDto) {
    if (dto.contact_uuid) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: dto.contact_uuid, company_uuid: companyUuid },
      });
      if (!contact) throw new NotFoundException('Contact not found');
      if (contact.do_not_call) {
        throw new BadRequestException({
          code: CallPlacementErrorCodes.CONTACT_DO_NOT_CALL,
          message: 'This contact is marked do-not-call',
        });
      }
      if (!contact.phone) throw new BadRequestException('Contact has no phone number');
      return contact;
    }

    const phone = toE164(dto.contact.phone);
    if (!phone) {
      throw new BadRequestException({
        code: CallPlacementErrorCodes.INVALID_PHONE_NUMBER,
        message: 'Invalid phone number',
      });
    }

    const existing = await this.prisma.contact.findFirst({
      where: { company_uuid: companyUuid, phone },
    });
    if (existing) {
      if (existing.do_not_call) {
        throw new BadRequestException({
          code: CallPlacementErrorCodes.CONTACT_DO_NOT_CALL,
          message: 'This contact is marked do-not-call',
        });
      }
      return existing;
    }

    return this.prisma.contact.create({
      data: { company_uuid: companyUuid, phone, name: dto.contact.name ?? null },
    });
  }

  private async computeTime(companyUuid: string, when: ScheduleWhenDto): Promise<Date> {
    const [company, hours] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyUuid }, select: { timezone: true } }),
      this.prisma.companyCallingHour.findMany({ where: { company_uuid: companyUuid } }),
    ]);
    const requested = resolveRequestedTime(when, company?.timezone ?? 'UTC', hours);
    return this.callingHours.nextAllowedTime(companyUuid, requested);
  }
}
