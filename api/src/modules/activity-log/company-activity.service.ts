import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { ActivityLogQueryType } from './dto/activity-log-query.schema';
import { ActivityLogItem } from './interfaces/activity-log.interface';

/** Read side of the activity log; writes go through the shared ActivityLogService. */
@Injectable()
export class CompanyActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyUuid: string, query: ActivityLogQueryType) {
    const { page, limit } = query;
    const where: Prisma.ActivityLogWhereInput = {
      company_uuid: companyUuid,
      ...(query.entity_type && { entity_type: query.entity_type }),
      ...(query.entity_uuid && { entity_uuid: query.entity_uuid }),
      ...(query.user_uuid && { user_uuid: query.user_uuid }),
      ...(query.action && { action: { startsWith: query.action } }),
      ...((query.from || query.to) && {
        created_at: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...skipTake({ page, limit }),
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const data: ActivityLogItem[] = rows.map(({ user, user_uuid, company_uuid, ip_address, ...entry }) => ({
      id: entry.id,
      actor: user,
      actor_type: entry.actor_type,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_uuid: entry.entity_uuid,
      metadata: entry.metadata,
      created_at: entry.created_at,
    }));

    return paginated(data, total, page, limit);
  }
}
