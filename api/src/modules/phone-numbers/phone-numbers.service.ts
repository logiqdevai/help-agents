import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AlertSeverity,
  AlertType,
  PhoneNumberSource,
  PhoneNumberStatus,
  Prisma,
  VoiceProvider,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { paginated } from '@/shared/utils/pagination/pagination';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { VoiceProviderService } from '../voice-provider/voice-provider.service';
import { AssignAgentDto } from './dto/assign-agent.dto';
import { ImportPhoneNumberDto } from './dto/import-phone-number.dto';
import { PhoneNumbersQueryType } from './dto/phone-numbers-query.schema';
import { ProvisionPhoneNumberDto } from './dto/provision-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { PhoneNumberResponse } from './interfaces/phone-number.interface';

const WITH_AGENT = { agent: { select: { id: true, name: true } } } satisfies Prisma.PhoneNumberInclude;
type PhoneNumberRow = Prisma.PhoneNumberGetPayload<{ include: typeof WITH_AGENT }>;

@Injectable()
export class PhoneNumbersService {
  private readonly logger = new Logger(PhoneNumbersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: VoiceProviderService,
    private readonly activity: ActivityLogService,
    private readonly alerts: AlertsService,
  ) {}

  async findAll(ctx: CompanyContextData, query: PhoneNumbersQueryType) {
    const where: Prisma.PhoneNumberWhereInput = {
      company_uuid: ctx.company_uuid,
      status: query.status ?? { not: PhoneNumberStatus.RELEASED },
      ...(query.source && { source: query.source }),
      ...(query.agent_uuid && { agent_uuid: query.agent_uuid }),
      ...(query.search && {
        OR: [
          { number: { contains: query.search } },
          { label: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.phoneNumber.findMany({
        where,
        include: WITH_AGENT,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.order_by]: query.order_direction },
      }),
      this.prisma.phoneNumber.count({ where }),
    ]);

    return paginated(items.map((i) => this.toResponse(i)), total, query.page, query.limit);
  }

  async findOne(ctx: CompanyContextData, id: string): Promise<PhoneNumberResponse> {
    return this.toResponse(await this.getOwned(ctx.company_uuid, id));
  }

  async provision(ctx: CompanyContextData, dto: ProvisionPhoneNumberDto): Promise<PhoneNumberResponse> {
    let provided;
    try {
      provided = await this.voice.provisionPhoneNumber({
        company_uuid: ctx.company_uuid,
        country_code: dto.country_code,
        area_code: dto.area_code,
        label: dto.label,
      });
    } catch (error) {
      await this.alerts.raise({
        company_uuid: ctx.company_uuid,
        type: AlertType.NO_PHONE_NUMBER_AVAILABLE,
        severity: AlertSeverity.WARNING,
        title: 'Could not get a phone number',
        message: 'A new phone number could not be provisioned. Try a different area code or bring your own number.',
      });
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Provisioning failed: ${error?.message}`);
      throw new ServiceUnavailableException('A phone number could not be provisioned right now. Please try again shortly.');
    }

    const created = await this.saveNumber(ctx.company_uuid, provided.number, {
      label: dto.label ?? null,
      source: PhoneNumberSource.PROVISIONED,
      external_id: provided.external_id,
      provider_number_type: provided.provider_number_type,
      byo_config: undefined,
    }).catch(async (error) => {
      await this.voice.releasePhoneNumber(provided.number).catch(() => undefined);
      throw error;
    });

    await this.activity.logFor(ctx, 'phone_number.provisioned', 'phone_number', created.id, {
      number: created.number,
    });
    return this.toResponse(created);
  }

  async importOwn(ctx: CompanyContextData, dto: ImportPhoneNumberDto): Promise<PhoneNumberResponse> {
    const number = toE164(dto.number, dto.default_country);
    if (!number) throw new BadRequestException('Invalid phone number. Use international format, e.g. +302101234567.');

    const existing = await this.prisma.phoneNumber.findUnique({ where: { number } });
    if (existing && existing.status !== PhoneNumberStatus.RELEASED) {
      throw new ConflictException('This phone number is already connected');
    }

    let imported;
    try {
      imported = await this.voice.importPhoneNumber({
        company_uuid: ctx.company_uuid,
        number,
        termination_uri: dto.termination_uri,
        sip_username: dto.sip_username,
        sip_password: dto.sip_password,
        label: dto.label,
      });
    } catch (error) {
      this.logger.error(`Import failed: ${error?.message}`);
      throw new BadRequestException(
        'The phone number could not be connected. Check the number and your carrier trunk details, then try again.',
      );
    }

    const created = await this.saveNumber(ctx.company_uuid, number, {
      label: dto.label ?? null,
      source: PhoneNumberSource.BYO,
      external_id: imported.external_id,
      provider_number_type: imported.provider_number_type,
      byo_config: (imported.byo_config ?? undefined) as Prisma.InputJsonValue | undefined,
    }).catch(async (error) => {
      await this.voice.releasePhoneNumber(number).catch(() => undefined);
      throw error;
    });

    await this.activity.logFor(ctx, 'phone_number.imported', 'phone_number', created.id, { number });
    return this.toResponse(created);
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdatePhoneNumberDto): Promise<PhoneNumberResponse> {
    await this.getOwned(ctx.company_uuid, id);
    const updated = await this.prisma.phoneNumber.update({
      where: { id },
      data: { ...(dto.label !== undefined && { label: dto.label }) },
      include: WITH_AGENT,
    });
    await this.activity.logFor(ctx, 'phone_number.updated', 'phone_number', id);
    return this.toResponse(updated);
  }

  async assignAgent(ctx: CompanyContextData, id: string, dto: AssignAgentDto): Promise<PhoneNumberResponse> {
    const phone = await this.getOwned(ctx.company_uuid, id);
    if (phone.status !== PhoneNumberStatus.ACTIVE) {
      throw new BadRequestException('Only active phone numbers can be assigned to an agent');
    }

    const agentUuid = dto.agent_uuid ?? null;
    if (agentUuid) {
      const agent = await this.prisma.agent.findFirst({
        where: { id: agentUuid, company_uuid: ctx.company_uuid, deleted_at: null },
        select: { id: true },
      });
      if (!agent) throw new NotFoundException('Agent not found');
    }

    if (phone.agent_uuid === agentUuid) return this.toResponse(phone);

    try {
      await this.voice.bindPhoneNumber(phone.number, agentUuid);
    } catch (error) {
      this.logger.error(`Binding ${phone.number} failed: ${error?.message}`);
      await this.prisma.phoneNumber.update({
        where: { id },
        data: { last_error: 'The number could not be connected to the agent. Please try again.' },
      });
      throw new ServiceUnavailableException('The number could not be connected to the agent. Please try again shortly.');
    }

    const updated = await this.prisma.phoneNumber.update({
      where: { id },
      data: { agent_uuid: agentUuid, last_error: null },
      include: WITH_AGENT,
    });
    await this.activity.logFor(
      ctx,
      agentUuid ? 'phone_number.assigned' : 'phone_number.unassigned',
      'phone_number',
      id,
      { number: phone.number, agent_uuid: agentUuid, previous_agent_uuid: phone.agent_uuid },
    );
    return this.toResponse(updated);
  }

  async release(ctx: CompanyContextData, id: string): Promise<{ message: string }> {
    const phone = await this.getOwned(ctx.company_uuid, id);
    if (phone.status === PhoneNumberStatus.RELEASED) return { message: 'Phone number already released' };

    const pendingCalls = await this.prisma.scheduledCall.count({
      where: { agent: { phone_numbers: { some: { id } } }, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    });
    if (pendingCalls > 0 && phone.agent_uuid) {
      const others = await this.prisma.phoneNumber.count({
        where: {
          company_uuid: ctx.company_uuid,
          agent_uuid: phone.agent_uuid,
          status: PhoneNumberStatus.ACTIVE,
          id: { not: id },
        },
      });
      if (others === 0) {
        throw new ConflictException(
          'This is the only number of an agent with scheduled calls. Assign another number or cancel the scheduled calls first.',
        );
      }
    }

    try {
      if (phone.agent_uuid) await this.voice.bindPhoneNumber(phone.number, null).catch(() => undefined);
      await this.voice.releasePhoneNumber(phone.number);
    } catch (error) {
      this.logger.error(`Releasing ${phone.number} failed: ${error?.message}`);
      throw new ServiceUnavailableException('The phone number could not be released right now. Please try again shortly.');
    }

    await this.prisma.phoneNumber.update({
      where: { id },
      data: { status: PhoneNumberStatus.RELEASED, agent_uuid: null, last_error: null },
    });
    await this.activity.logFor(ctx, 'phone_number.released', 'phone_number', id, { number: phone.number });
    return { message: 'Phone number released' };
  }

  private async saveNumber(
    companyUuid: string,
    number: string,
    data: {
      label: string | null;
      source: PhoneNumberSource;
      external_id: string;
      provider_number_type: string;
      byo_config?: Prisma.InputJsonValue;
    },
  ): Promise<PhoneNumberRow> {
    const fields = {
      company_uuid: companyUuid,
      number,
      label: data.label,
      source: data.source,
      status: PhoneNumberStatus.ACTIVE,
      provider: VoiceProvider.RETELL,
      external_id: data.external_id,
      provider_number_type: data.provider_number_type,
      byo_config: data.byo_config,
      agent_uuid: null,
      last_error: null,
    };

    try {
      const existing = await this.prisma.phoneNumber.findUnique({ where: { number } });
      if (existing?.status === PhoneNumberStatus.RELEASED) {
        return await this.prisma.phoneNumber.update({ where: { id: existing.id }, data: fields, include: WITH_AGENT });
      }
      return await this.prisma.phoneNumber.create({ data: fields, include: WITH_AGENT });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This phone number is already connected');
      }
      throw error;
    }
  }

  private async getOwned(companyUuid: string, id: string): Promise<PhoneNumberRow> {
    const phone = await this.prisma.phoneNumber.findFirst({
      where: { id, company_uuid: companyUuid },
      include: WITH_AGENT,
    });
    if (!phone) throw new NotFoundException('Phone number not found');
    return phone;
  }

  private toResponse(phone: PhoneNumberRow): PhoneNumberResponse {
    const byo = (phone.byo_config ?? null) as { termination_uri?: string; inbound_sip_address?: string } | null;
    return {
      id: phone.id,
      number: phone.number,
      label: phone.label,
      source: phone.source,
      status: phone.status,
      last_error: phone.last_error,
      agent: phone.agent ? { id: phone.agent.id, name: phone.agent.name } : null,
      ...(phone.source === PhoneNumberSource.BYO && {
        setup: {
          inbound_sip_address: byo?.inbound_sip_address ?? null,
          termination_uri: byo?.termination_uri ?? null,
        },
      }),
      created_at: phone.created_at,
      updated_at: phone.updated_at,
    };
  }
}
