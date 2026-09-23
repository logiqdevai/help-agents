import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { PERMISSIONS_KEY, CompanyContextData } from '../decorators/company.decorator';
import { resolvePermissions } from '../permissions/permissions';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves the caller's company membership (header `x-company-id`, else the oldest
 * membership) and enforces role/permission requirements. Must run after JwtGuard.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    const requested = request.headers['x-company-id'];
    const companyId = Array.isArray(requested) ? requested[0] : requested;

    if (companyId && !UUID_RE.test(companyId)) {
      throw new ForbiddenException('Invalid company');
    }

    const membership = await this.prisma.companyMember.findFirst({
      where: {
        user_uuid: user.id,
        company: { deleted_at: null },
        ...(companyId ? { company_uuid: companyId } : {}),
      },
      orderBy: { created_at: 'asc' },
    });

    if (!membership) {
      throw new ForbiddenException(
        companyId ? 'You are not a member of this company' : 'You do not belong to any company',
      );
    }

    const permissions = resolvePermissions(membership.role, membership.permissions);
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (required?.length && !required.every((p) => permissions.has(p))) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    const data: CompanyContextData = {
      user_uuid: user.id,
      auth_role: user.role,
      company_uuid: membership.company_uuid,
      member_uuid: membership.id,
      role: membership.role,
      permissions: [...permissions],
    };
    request.company = data;
    return true;
  }
}
