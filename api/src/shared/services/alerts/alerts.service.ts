import { Injectable, Logger } from '@nestjs/common';
import { AlertSeverity, AlertStatus, AlertType, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

export interface RaiseAlertInput {
  company_uuid: string;
  type: AlertType;
  title: string;
  message?: string | null;
  severity?: AlertSeverity;
  entity_type?: string | null;
  entity_uuid?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * User-visible problems (spec §33). An OPEN alert for the same
 * company + type + entity is updated instead of duplicated. Never throws.
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async raise(input: RaiseAlertInput): Promise<void> {
    try {
      const existing = await this.prisma.alert.findFirst({
        where: {
          company_uuid: input.company_uuid,
          type: input.type,
          status: AlertStatus.OPEN,
          entity_type: input.entity_type ?? null,
          entity_uuid: input.entity_uuid ?? null,
        },
      });

      if (existing) {
        await this.prisma.alert.update({
          where: { id: existing.id },
          data: {
            title: input.title,
            message: input.message ?? null,
            severity: input.severity ?? existing.severity,
            metadata: input.metadata,
          },
        });
        return;
      }

      await this.prisma.alert.create({
        data: {
          company_uuid: input.company_uuid,
          type: input.type,
          severity: input.severity ?? AlertSeverity.ERROR,
          title: input.title,
          message: input.message ?? null,
          entity_type: input.entity_type ?? null,
          entity_uuid: input.entity_uuid ?? null,
          metadata: input.metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to raise alert "${input.title}": ${error?.message}`);
    }
  }

  /** Resolves OPEN alerts for an entity once the underlying problem is fixed. */
  async resolveFor(
    company_uuid: string,
    type: AlertType,
    entity_type: string,
    entity_uuid: string,
  ): Promise<void> {
    try {
      await this.prisma.alert.updateMany({
        where: { company_uuid, type, entity_type, entity_uuid, status: AlertStatus.OPEN },
        data: { status: AlertStatus.RESOLVED, resolved_at: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to resolve alerts: ${error?.message}`);
    }
  }
}
