import { Injectable, Logger } from '@nestjs/common';
import { ActorType, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';

export interface ActivityLogInput {
  company_uuid: string;
  user_uuid?: string | null;
  actor_type?: ActorType;
  /** Dotted verb, e.g. "agent.created", "call.started", "crm.contact_updated". */
  action: string;
  entity_type?: string | null;
  entity_uuid?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip_address?: string | null;
}

/** Audit trail (spec §32). Logging never throws and never blocks the caller. */
@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: ActivityLogInput): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          company_uuid: input.company_uuid,
          user_uuid: input.user_uuid ?? null,
          actor_type: input.actor_type ?? (input.user_uuid ? ActorType.USER : ActorType.SYSTEM),
          action: input.action,
          entity_type: input.entity_type ?? null,
          entity_uuid: input.entity_uuid ?? null,
          metadata: input.metadata,
          ip_address: input.ip_address ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write activity log "${input.action}": ${error?.message}`);
    }
  }

  /** Convenience for request handlers: actor and company come from the guard context. */
  logFor(
    ctx: Pick<CompanyContextData, 'company_uuid' | 'user_uuid'>,
    action: string,
    entity_type?: string | null,
    entity_uuid?: string | null,
    metadata?: Prisma.InputJsonValue,
    ip_address?: string | null,
  ): Promise<void> {
    return this.log({
      company_uuid: ctx.company_uuid,
      user_uuid: ctx.user_uuid,
      actor_type: ActorType.USER,
      action,
      entity_type,
      entity_uuid,
      metadata,
      ip_address,
    });
  }
}
