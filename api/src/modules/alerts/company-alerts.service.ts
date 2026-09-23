import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertStatus, AlertType, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { AlertsQueryType } from './dto/alerts-query.schema';

/** Read/manage side of alerts; raising alerts goes through the shared AlertsService. */
@Injectable()
export class CompanyAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  async findAll(companyUuid: string, query: AlertsQueryType) {
    const { page, limit } = query;
    const where: Prisma.AlertWhereInput = {
      company_uuid: companyUuid,
      ...(query.status !== 'ALL' && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.severity && { severity: query.severity }),
      ...(query.entity_type && { entity_type: query.entity_type }),
      ...(query.entity_uuid && { entity_uuid: query.entity_uuid }),
    };

    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...skipTake({ page, limit }),
      }),
      this.prisma.alert.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  }

  async summary(companyUuid: string) {
    const where = { company_uuid: companyUuid, status: AlertStatus.OPEN };
    const [byType, bySeverity] = await Promise.all([
      this.prisma.alert.groupBy({ by: ['type'], where, _count: { _all: true } }),
      this.prisma.alert.groupBy({ by: ['severity'], where, _count: { _all: true } }),
    ]);

    return {
      open_total: byType.reduce((sum, r) => sum + r._count._all, 0),
      by_type: byType.map((r) => ({ type: r.type, count: r._count._all })),
      by_severity: bySeverity.map((r) => ({ severity: r.severity, count: r._count._all })),
    };
  }

  resolve(ctx: CompanyContextData, alertUuid: string) {
    return this.transition(ctx, alertUuid, AlertStatus.RESOLVED, 'alert.resolved');
  }

  dismiss(ctx: CompanyContextData, alertUuid: string) {
    return this.transition(ctx, alertUuid, AlertStatus.DISMISSED, 'alert.dismissed');
  }

  async dismissAll(ctx: CompanyContextData, type?: AlertType) {
    const result = await this.prisma.alert.updateMany({
      where: {
        company_uuid: ctx.company_uuid,
        status: AlertStatus.OPEN,
        ...(type && { type }),
      },
      data: { status: AlertStatus.DISMISSED },
    });

    if (result.count > 0) {
      await this.activity.logFor(ctx, 'alert.dismissed_all', 'alert', null, {
        count: result.count,
        ...(type && { type }),
      });
    }

    return { dismissed: result.count };
  }

  private async transition(
    ctx: CompanyContextData,
    alertUuid: string,
    status: 'RESOLVED' | 'DISMISSED',
    action: string,
  ) {
    const alert = await this.prisma.alert.findFirst({
      where: { id: alertUuid, company_uuid: ctx.company_uuid },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.status === status) return alert;

    const updated = await this.prisma.alert.update({
      where: { id: alert.id },
      data: {
        status,
        resolved_at: status === AlertStatus.RESOLVED ? new Date() : alert.resolved_at,
      },
    });

    await this.activity.logFor(ctx, action, 'alert', alert.id, { type: alert.type });
    return updated;
  }
}
