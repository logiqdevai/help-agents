import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyMember, CompanyRole, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { isKnownPermission, Permissions } from '@/shared/permissions/permissions';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { canManageRole } from '../utils/team-policy.utils';
import { SetAgentAccessDto, UpdateMemberDto } from '../dto/team.dto';
import { MembersQueryType } from '../dto/team-query.schema';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  async list(ctx: CompanyContextData, query: MembersQueryType) {
    const where: Prisma.CompanyMemberWhereInput = {
      company_uuid: ctx.company_uuid,
      ...(query.role && { role: query.role }),
      ...(query.search && {
        user: {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.companyMember.findMany({
        where,
        ...skipTake(query),
        orderBy: { created_at: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true, email_verified_at: true, last_login_at: true } },
          _count: { select: { agent_access: true } },
        },
      }),
      this.prisma.companyMember.count({ where }),
    ]);

    const data = items.map((m) => ({
      id: m.id,
      role: m.role,
      permissions: m.permissions,
      is_self: m.user_uuid === ctx.user_uuid,
      agent_access_count: m._count.agent_access,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        email_verified: !!m.user.email_verified_at,
        last_login_at: m.user.last_login_at,
      },
      created_at: m.created_at,
    }));

    return paginated(data, total, query.page, query.limit);
  }

  async update(ctx: CompanyContextData, memberId: string, dto: UpdateMemberDto, ip?: string) {
    const member = await this.findMember(ctx.company_uuid, memberId);
    this.assertCanManage(ctx, member);

    const data: Prisma.CompanyMemberUpdateInput = {};

    if (dto.role !== undefined && dto.role !== member.role) {
      if (!canManageRole(ctx.role, dto.role)) {
        throw new ForbiddenException('You cannot assign this role');
      }
      if (member.role === CompanyRole.OWNER) await this.assertAnotherOwner(ctx.company_uuid, member.id);
      data.role = dto.role;
    }

    if (dto.permissions !== undefined) {
      const permissions = [...new Set(dto.permissions)];
      const invalid = permissions.filter((p) => !isKnownPermission(p));
      if (invalid.length) throw new BadRequestException(`Unknown permissions: ${invalid.join(', ')}`);
      if (permissions.includes(Permissions.COMPANY_DELETE)) {
        throw new BadRequestException('company.delete is reserved for the owner role');
      }
      data.permissions = permissions;
    }

    const updated = await this.prisma.companyMember.update({ where: { id: member.id }, data });

    await this.activity.logFor(ctx, 'team.member_updated', 'company_member', member.id, {
      role: updated.role,
      previous_role: member.role,
    }, ip);

    return { id: updated.id, role: updated.role, permissions: updated.permissions };
  }

  async remove(ctx: CompanyContextData, memberId: string, ip?: string) {
    const member = await this.findMember(ctx.company_uuid, memberId);
    this.assertCanManage(ctx, member);
    if (member.role === CompanyRole.OWNER) await this.assertAnotherOwner(ctx.company_uuid, member.id);

    await this.prisma.companyMember.delete({ where: { id: member.id } });
    await this.activity.logFor(ctx, 'team.member_removed', 'company_member', member.id, { user_uuid: member.user_uuid }, ip);

    return { message: 'Member removed' };
  }

  async leave(ctx: CompanyContextData, ip?: string) {
    if (ctx.role === CompanyRole.OWNER) await this.assertAnotherOwner(ctx.company_uuid, ctx.member_uuid);

    await this.prisma.companyMember.delete({ where: { id: ctx.member_uuid } });
    await this.activity.logFor(ctx, 'team.member_left', 'company_member', ctx.member_uuid, undefined, ip);

    return { message: 'You left the company' };
  }

  async getAgentAccess(ctx: CompanyContextData, memberId: string) {
    const member = await this.findMember(ctx.company_uuid, memberId);
    const grants = await this.prisma.agentAccess.findMany({
      where: { member_uuid: member.id, agent: { company_uuid: ctx.company_uuid, deleted_at: null } },
      include: { agent: { select: { id: true, name: true, status: true } } },
    });

    return {
      member_uuid: member.id,
      unrestricted: member.role !== CompanyRole.MEMBER,
      agents: grants.map((g) => g.agent),
    };
  }

  async setAgentAccess(ctx: CompanyContextData, memberId: string, dto: SetAgentAccessDto, ip?: string) {
    const member = await this.findMember(ctx.company_uuid, memberId);
    this.assertCanManage(ctx, member);

    const agentIds = [...new Set(dto.agent_uuids)];
    if (agentIds.length) {
      const found = await this.prisma.agent.count({
        where: { id: { in: agentIds }, company_uuid: ctx.company_uuid, deleted_at: null },
      });
      if (found !== agentIds.length) throw new BadRequestException('One or more agents do not exist');
    }

    await this.prisma.$transaction([
      this.prisma.agentAccess.deleteMany({ where: { member_uuid: member.id } }),
      this.prisma.agentAccess.createMany({
        data: agentIds.map((agent_uuid) => ({ agent_uuid, member_uuid: member.id })),
      }),
    ]);

    await this.activity.logFor(ctx, 'team.agent_access_updated', 'company_member', member.id, {
      agent_count: agentIds.length,
    }, ip);

    return this.getAgentAccess(ctx, memberId);
  }

  private async findMember(companyUuid: string, memberId: string): Promise<CompanyMember> {
    const member = await this.prisma.companyMember.findFirst({
      where: { id: memberId, company_uuid: companyUuid },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  private assertCanManage(ctx: CompanyContextData, member: CompanyMember) {
    if (!canManageRole(ctx.role, member.role)) {
      throw new ForbiddenException('You cannot manage this member');
    }
  }

  private async assertAnotherOwner(companyUuid: string, excludeMemberId: string) {
    const others = await this.prisma.companyMember.count({
      where: { company_uuid: companyUuid, role: CompanyRole.OWNER, id: { not: excludeMemberId } },
    });
    if (others === 0) {
      throw new BadRequestException('A company must keep at least one owner');
    }
  }
}
