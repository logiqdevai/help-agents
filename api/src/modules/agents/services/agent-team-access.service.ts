import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CompanyRole } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { canManageRole } from '@/modules/companies/utils/team-policy.utils';
import { AgentsService } from '../agents.service';
import { SetAgentMembersDto } from '../dto/agent-access.dto';
import { AgentAccessList } from '../interfaces/agent.interface';

/** Which team members can use one agent: the agent-centric view of the per-member access grants. */
@Injectable()
export class AgentTeamAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agents: AgentsService,
    private readonly activity: ActivityLogService,
  ) {}

  /** Owners, admins and viewers always see every agent; members only the ones granted to them. */
  async get(ctx: CompanyContextData, agentId: string): Promise<AgentAccessList> {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const [members, grants] = await Promise.all([
      this.prisma.companyMember.findMany({
        where: { company_uuid: ctx.company_uuid },
        orderBy: { created_at: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.agentAccess.findMany({ where: { agent_uuid: agentId }, select: { member_uuid: true } }),
    ]);
    const granted = new Set(grants.map((grant) => grant.member_uuid));

    return {
      agent_uuid: agentId,
      members: members.map((member) => {
        const unrestricted = member.role !== CompanyRole.MEMBER;
        return {
          member_uuid: member.id,
          role: member.role,
          unrestricted,
          has_access: unrestricted || granted.has(member.id),
          user: member.user,
        };
      }),
    };
  }

  async replace(ctx: CompanyContextData, agentId: string, dto: SetAgentMembersDto): Promise<AgentAccessList> {
    await this.agents.getAgentOrThrow(ctx, agentId);

    const wanted = new Set(dto.member_uuids);
    const [members, grants] = await Promise.all([
      this.prisma.companyMember.findMany({
        where: { company_uuid: ctx.company_uuid, role: CompanyRole.MEMBER },
        select: { id: true, role: true },
      }),
      this.prisma.agentAccess.findMany({ where: { agent_uuid: agentId }, select: { member_uuid: true } }),
    ]);

    const restrictedIds = new Set(members.map((member) => member.id));
    if ([...wanted].some((id) => !restrictedIds.has(id))) {
      throw new BadRequestException('Only members can be given access to an agent one by one');
    }

    const current = new Set(grants.map((grant) => grant.member_uuid));
    const toAdd = [...wanted].filter((id) => !current.has(id));
    const toRemove = [...current].filter((id) => !wanted.has(id));

    if (!canManageRole(ctx.role, CompanyRole.MEMBER)) {
      throw new ForbiddenException('You cannot manage who can use this agent');
    }

    await this.prisma.$transaction([
      this.prisma.agentAccess.deleteMany({ where: { agent_uuid: agentId, member_uuid: { in: toRemove } } }),
      this.prisma.agentAccess.createMany({
        data: toAdd.map((member_uuid) => ({ agent_uuid: agentId, member_uuid })),
        skipDuplicates: true,
      }),
    ]);

    await this.activity.logFor(ctx, 'agent.access_updated', 'agent', agentId, {
      added: toAdd.length,
      removed: toRemove.length,
    });
    return this.get(ctx, agentId);
  }
}
