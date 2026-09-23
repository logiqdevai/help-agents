import { Injectable } from '@nestjs/common';
import { AlertType, Integration, IntegrationStatus } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';

/** Connection health bookkeeping shared by CRM calls and the explicit "test connection" endpoint. */
@Injectable()
export class IntegrationStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  async markFailed(integration: Integration, reason: string): Promise<void> {
    await this.prisma.integration
      .update({
        where: { id: integration.id },
        data: { status: IntegrationStatus.ERROR, last_error: reason.slice(0, 500) },
      })
      .catch(() => undefined);

    await this.alerts.raise({
      company_uuid: integration.company_uuid,
      type: AlertType.INTEGRATION_FAILED,
      title: `${integration.name} connection failed`,
      message: reason.slice(0, 500),
      entity_type: 'integration',
      entity_uuid: integration.id,
    });
  }

  async markHealthy(integration: Integration): Promise<void> {
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.ACTIVE, last_error: null, last_verified_at: new Date() },
    });
    await this.alerts.resolveFor(integration.company_uuid, AlertType.INTEGRATION_FAILED, 'integration', integration.id);
  }
}
