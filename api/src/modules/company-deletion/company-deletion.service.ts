import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { DELETION_GRACE_DAYS } from './company-deletion.constants';
import { RequestCompanyDeletionDto } from './dto/request-company-deletion.dto';
import { CompanyDeletionStatus } from './interfaces/company-deletion.interface';

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

@Injectable()
export class CompanyDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  async getStatus(companyUuid: string): Promise<CompanyDeletionStatus> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyUuid, deleted_at: null },
      select: { deletion_requested_at: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return this.toStatus(company.deletion_requested_at);
  }

  async requestDeletion(
    ctx: CompanyContextData,
    dto: RequestCompanyDeletionDto,
    ipAddress?: string,
  ): Promise<CompanyDeletionStatus> {
    const [user, company] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: ctx.user_uuid }, select: { password: true } }),
      this.prisma.company.findFirst({
        where: { id: ctx.company_uuid, deleted_at: null },
        select: { name: true, deletion_requested_at: true },
      }),
    ]);
    if (!company) throw new NotFoundException('Company not found');
    if (company.deletion_requested_at) {
      throw new ConflictException('A deletion request is already pending for this company');
    }

    const passwordOk = !!user?.password && (await bcrypt.compare(dto.password, user.password));
    if (!passwordOk) throw new BadRequestException('Incorrect password');

    if (normalizeName(dto.company_name) !== normalizeName(company.name)) {
      throw new BadRequestException('Company name does not match');
    }

    const requestedAt = new Date();
    const result = await this.prisma.company.updateMany({
      where: { id: ctx.company_uuid, deleted_at: null, deletion_requested_at: null },
      data: { deletion_requested_at: requestedAt },
    });
    if (result.count === 0) {
      throw new ConflictException('A deletion request is already pending for this company');
    }

    await this.activity.logFor(
      ctx,
      'company.deletion_requested',
      'company',
      ctx.company_uuid,
      { scheduled_purge_at: this.purgeDate(requestedAt).toISOString() },
      ipAddress,
    );

    return this.toStatus(requestedAt);
  }

  async cancelDeletion(ctx: CompanyContextData, ipAddress?: string): Promise<CompanyDeletionStatus> {
    const result = await this.prisma.company.updateMany({
      where: {
        id: ctx.company_uuid,
        deleted_at: null,
        deletion_requested_at: { not: null },
      },
      data: { deletion_requested_at: null },
    });
    if (result.count === 0) throw new NotFoundException('No pending deletion request');

    await this.activity.logFor(ctx, 'company.deletion_cancelled', 'company', ctx.company_uuid, undefined, ipAddress);
    return this.toStatus(null);
  }

  private purgeDate(requestedAt: Date): Date {
    return new Date(requestedAt.getTime() + DELETION_GRACE_DAYS * DAY_MS);
  }

  private toStatus(requestedAt: Date | null): CompanyDeletionStatus {
    return {
      deletion_requested: !!requestedAt,
      requested_at: requestedAt,
      scheduled_purge_at: requestedAt ? this.purgeDate(requestedAt) : null,
      grace_period_days: DELETION_GRACE_DAYS,
    };
  }
}
