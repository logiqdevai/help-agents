import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IANAZone } from 'luxon';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { SetCallingHoursDto } from '../dto/calling-hours.dto';

const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  async listForUser(userUuid: string) {
    const memberships = await this.prisma.companyMember.findMany({
      where: { user_uuid: userUuid, company: { deleted_at: null } },
      include: { company: { select: { id: true, name: true, timezone: true } } },
      orderBy: { created_at: 'asc' },
    });

    return {
      data: memberships.map((m) => ({
        id: m.company.id,
        name: m.company.name,
        timezone: m.company.timezone,
        role: m.role,
      })),
    };
  }

  async getCurrent(ctx: CompanyContextData) {
    const [company, member_count] = await Promise.all([
      this.prisma.company.findFirst({ where: { id: ctx.company_uuid, deleted_at: null } }),
      this.prisma.companyMember.count({ where: { company_uuid: ctx.company_uuid } }),
    ]);
    if (!company) throw new NotFoundException('Company not found');

    return {
      id: company.id,
      name: company.name,
      website: company.website,
      phone: company.phone,
      timezone: company.timezone,
      recording_retention_days: company.recording_retention_days,
      deletion_requested_at: company.deletion_requested_at,
      created_at: company.created_at,
      member_count,
      my_role: ctx.role,
      my_permissions: ctx.permissions,
    };
  }

  async update(ctx: CompanyContextData, dto: UpdateCompanyDto, ip?: string) {
    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.website !== undefined) data.website = dto.website?.trim() || null;

    if (dto.phone !== undefined) {
      const phone = dto.phone ? toE164(dto.phone) : null;
      if (dto.phone && !phone) {
        throw new BadRequestException('Invalid phone number (use international format, e.g. +302100000000)');
      }
      data.phone = phone;
    }

    if (dto.timezone !== undefined) {
      if (!IANAZone.isValidZone(dto.timezone)) throw new BadRequestException('Invalid timezone');
      data.timezone = dto.timezone;
    }

    if (dto.recording_retention_days !== undefined) {
      data.recording_retention_days = dto.recording_retention_days;
    }

    await this.prisma.company.update({ where: { id: ctx.company_uuid }, data });
    await this.activity.logFor(ctx, 'company.updated', 'company', ctx.company_uuid, { fields: Object.keys(data) }, ip);

    return this.getCurrent(ctx);
  }

  async getCallingHours(ctx: CompanyContextData) {
    const [company, rows] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: ctx.company_uuid }, select: { timezone: true } }),
      this.prisma.companyCallingHour.findMany({ where: { company_uuid: ctx.company_uuid } }),
    ]);

    const byDay = new Map(rows.map((r) => [r.day_of_week, r]));
    const days = [0, 1, 2, 3, 4, 5, 6].map((day_of_week) => {
      const row = byDay.get(day_of_week);
      return {
        day_of_week,
        start_time: row?.start_time ?? DEFAULT_START,
        end_time: row?.end_time ?? DEFAULT_END,
        is_enabled: row ? row.is_enabled : rows.length === 0 && day_of_week >= 1 && day_of_week <= 5,
      };
    });

    return { timezone: company?.timezone ?? 'UTC', days };
  }

  async setCallingHours(ctx: CompanyContextData, dto: SetCallingHoursDto, ip?: string) {
    const seen = new Set<number>();
    for (const day of dto.days) {
      if (seen.has(day.day_of_week)) throw new BadRequestException(`Duplicate day_of_week ${day.day_of_week}`);
      seen.add(day.day_of_week);
      if (day.is_enabled && day.start_time >= day.end_time) {
        throw new BadRequestException(`start_time must be before end_time (day ${day.day_of_week})`);
      }
    }

    await this.prisma.$transaction(
      dto.days.map((day) =>
        this.prisma.companyCallingHour.upsert({
          where: { company_uuid_day_of_week: { company_uuid: ctx.company_uuid, day_of_week: day.day_of_week } },
          update: { start_time: day.start_time, end_time: day.end_time, is_enabled: day.is_enabled },
          create: {
            company_uuid: ctx.company_uuid,
            day_of_week: day.day_of_week,
            start_time: day.start_time,
            end_time: day.end_time,
            is_enabled: day.is_enabled,
          },
        }),
      ),
    );

    await this.activity.logFor(ctx, 'company.calling_hours_updated', 'company', ctx.company_uuid, undefined, ip);
    return this.getCallingHours(ctx);
  }
}
