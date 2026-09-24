import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { csvToArray, paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { ActivityLogQueryType } from './dto/activity-log-query.schema';
import { ActivityLogItem } from './interfaces/activity-log.interface';

interface EntityRef {
  entity_type: string | null;
  entity_uuid: string | null;
}

/** Read side of the activity log; writes go through the shared ActivityLogService. */
@Injectable()
export class CompanyActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyUuid: string, query: ActivityLogQueryType) {
    const { page, limit } = query;
    const entityTypes = csvToArray(query.entity_type);
    const where: Prisma.ActivityLogWhereInput = {
      company_uuid: companyUuid,
      ...(entityTypes && { entity_type: { in: entityTypes } }),
      ...(query.entity_uuid && { entity_uuid: query.entity_uuid }),
      ...(query.user_uuid && { user_uuid: query.user_uuid }),
      ...(query.actor_type && { actor_type: query.actor_type }),
      ...(query.action && { action: { startsWith: query.action } }),
      ...(query.search && {
        OR: [
          { action: { contains: query.search, mode: 'insensitive' } },
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
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

    const labels = await this.resolveEntityLabels(companyUuid, rows);

    const data: ActivityLogItem[] = rows.map(({ user, user_uuid, company_uuid, ...entry }) => ({
      id: entry.id,
      actor: user,
      actor_type: entry.actor_type,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_uuid: entry.entity_uuid,
      entity_label: labels.get(`${entry.entity_type}:${entry.entity_uuid}`) ?? null,
      metadata: entry.metadata,
      ip_address: entry.ip_address,
      created_at: entry.created_at,
    }));

    return paginated(data, total, page, limit);
  }

  /** Batch-resolves display names for the records referenced by a page of entries. */
  private async resolveEntityLabels(
    companyUuid: string,
    rows: EntityRef[],
  ): Promise<Map<string, string>> {
    const scopeFor = (type: string) => {
      const ids = [
        ...new Set(rows.filter((r) => r.entity_type === type && r.entity_uuid).map((r) => r.entity_uuid)),
      ];
      return ids.length ? { id: { in: ids }, company_uuid: companyUuid } : null;
    };
    const labels = new Map<string, string>();
    const add = (type: string, id: string, label: string | null | undefined) => {
      if (label) labels.set(`${type}:${id}`, label);
    };

    const agent = scopeFor('agent');
    const integration = scopeFor('integration');
    const knowledge = scopeFor('knowledge_source');
    const call = scopeFor('call');
    const contact = scopeFor('contact');
    const phoneNumber = scopeFor('phone_number');
    const invitation = scopeFor('company_invitation');

    const [agents, integrations, sources, calls, contacts, numbers, invitations] = await Promise.all([
      agent ? this.prisma.agent.findMany({ where: agent, select: { id: true, name: true } }) : [],
      integration
        ? this.prisma.integration.findMany({ where: integration, select: { id: true, name: true } })
        : [],
      knowledge
        ? this.prisma.knowledgeSource.findMany({ where: knowledge, select: { id: true, name: true } })
        : [],
      call ? this.prisma.call.findMany({ where: call, select: { id: true, call_number: true } }) : [],
      contact
        ? this.prisma.contact.findMany({ where: contact, select: { id: true, name: true, phone: true } })
        : [],
      phoneNumber
        ? this.prisma.phoneNumber.findMany({
            where: phoneNumber,
            select: { id: true, number: true, label: true },
          })
        : [],
      invitation
        ? this.prisma.companyInvitation.findMany({ where: invitation, select: { id: true, email: true } })
        : [],
    ]);

    agents.forEach((a) => add('agent', a.id, a.name));
    integrations.forEach((i) => add('integration', i.id, i.name));
    sources.forEach((k) => add('knowledge_source', k.id, k.name));
    calls.forEach((c) => add('call', c.id, `Call #${c.call_number}`));
    contacts.forEach((c) => add('contact', c.id, c.name ?? c.phone));
    numbers.forEach((n) => add('phone_number', n.id, n.label ?? n.number));
    invitations.forEach((i) => add('company_invitation', i.id, i.email));

    return labels;
  }
}
