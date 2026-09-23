import { ForbiddenException, Injectable } from '@nestjs/common';
import { CompanyRole } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';

type AccessCtx = Pick<CompanyContextData, 'role' | 'member_uuid' | 'company_uuid'>;

/**
 * MEMBERs only see agents (and their calls) they were granted through AgentAccess;
 * OWNER / ADMIN / VIEWER see the whole company.
 */
@Injectable()
export class AgentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** `null` = unrestricted, otherwise the agent ids the caller may see. */
  async getAccessibleAgentIds(ctx: AccessCtx): Promise<string[] | null> {
    if (ctx.role !== CompanyRole.MEMBER) return null;

    const grants = await this.prisma.agentAccess.findMany({
      where: { member_uuid: ctx.member_uuid, agent: { company_uuid: ctx.company_uuid } },
      select: { agent_uuid: true },
    });
    return grants.map((g) => g.agent_uuid);
  }

  /** Prisma `where` fragment restricting `field` to accessible agents; `{}` when unrestricted. */
  async agentScope(ctx: AccessCtx, field: 'agent_uuid' | 'id' = 'agent_uuid'): Promise<Record<string, any>> {
    const ids = await this.getAccessibleAgentIds(ctx);
    return ids === null ? {} : { [field]: { in: ids } };
  }

  async assertAgentAccess(ctx: AccessCtx, agentUuid: string): Promise<void> {
    const ids = await this.getAccessibleAgentIds(ctx);
    if (ids !== null && !ids.includes(agentUuid)) {
      throw new ForbiddenException('You do not have access to this agent');
    }
  }
}
