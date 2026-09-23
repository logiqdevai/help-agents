import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CompanyRole } from 'generated/prisma';
import { JwtGuard } from '../guards/jwt.guard';
import { CompanyGuard } from '../guards/company.guard';
import type { Permission } from '../permissions/permissions';

export const PERMISSIONS_KEY = 'company_permissions';

/** Permissions (all required) the caller needs for this handler/controller. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Authenticated user + resolved company membership. Every controller that touches
 * tenant data uses this at class level and declares `@RequirePermissions(...)` per handler.
 */
export const CompanyAuth = () =>
  applyDecorators(
    UseGuards(JwtGuard, CompanyGuard),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-company-id',
      required: false,
      description: "Company to act in. Defaults to the caller's first company.",
    }),
  );

export interface CompanyContextData {
  user_uuid: string;
  auth_role: string;
  company_uuid: string;
  member_uuid: string;
  role: CompanyRole;
  permissions: string[];
}

/** `@CompanyContext()` -> full context, `@CompanyContext('company_uuid')` -> one field. */
export const CompanyContext = createParamDecorator(
  (field: keyof CompanyContextData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const company: CompanyContextData | undefined = request.company;
    return field ? company?.[field] : company;
  },
);
