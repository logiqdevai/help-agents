import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrmFieldMapping, CrmRecordType, MappingDirection, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { GOAL_FIELD_PREFIX, INTERNAL_CRM_FIELDS } from '@/shared/constants/crm-fields';
import { CrmService } from '../crm/crm.service';
import { PutFieldMappingsDto } from '../dto/field-mappings.dto';
import { FieldMappingEntity } from '../entities/integration.entity';
import { IntegrationsService } from '../integrations.service';

const GOAL_KEY = /^[a-zA-Z0-9_]{1,64}$/;

const FIELD_LABELS: Record<string, string> = {
  [INTERNAL_CRM_FIELDS.CUSTOMER_NAME]: 'Customer name',
  [INTERNAL_CRM_FIELDS.PHONE]: 'Phone',
  [INTERNAL_CRM_FIELDS.EMAIL]: 'Email',
  [INTERNAL_CRM_FIELDS.CALL_OUTCOME]: 'Call outcome',
  [INTERNAL_CRM_FIELDS.CALL_SUMMARY]: 'Call summary',
  [INTERNAL_CRM_FIELDS.CALL_STATUS]: 'Call status',
  [INTERNAL_CRM_FIELDS.CALL_DURATION_SECONDS]: 'Call duration (seconds)',
  [INTERNAL_CRM_FIELDS.CALL_DATE]: 'Call date',
  [INTERNAL_CRM_FIELDS.INTEREST_LEVEL]: 'Interest level',
  [INTERNAL_CRM_FIELDS.NEXT_FOLLOW_UP_DATE]: 'Next follow-up date',
  [INTERNAL_CRM_FIELDS.LAST_CONTACT_DATE]: 'Last contact date',
  [INTERNAL_CRM_FIELDS.NOTES]: 'Notes',
};

@Injectable()
export class FieldMappingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly integrations: IntegrationsService,
    private readonly crm: CrmService,
    private readonly activity: ActivityLogService,
  ) {}

  internalFields() {
    return {
      data: Object.values(INTERNAL_CRM_FIELDS).map((key) => ({ key, label: FIELD_LABELS[key] ?? key })),
      goal_field_prefix: GOAL_FIELD_PREFIX,
      note: `Information collected against an agent's goal items can be mapped as "${GOAL_FIELD_PREFIX}<goal_item_key>".`,
    };
  }

  crmFields(companyUuid: string, integrationUuid: string, recordType: CrmRecordType) {
    return this.crm.listFields(companyUuid, integrationUuid, recordType);
  }

  async get(companyUuid: string, integrationUuid: string, agentUuid?: string) {
    await this.integrations.loadCrm(companyUuid, integrationUuid);
    if (agentUuid) await this.assertAgent(companyUuid, agentUuid);

    const [own, inherited] = await Promise.all([
      this.prisma.crmFieldMapping.findMany({
        where: { company_uuid: companyUuid, integration_uuid: integrationUuid, agent_uuid: agentUuid ?? null },
        orderBy: { created_at: 'asc' },
      }),
      agentUuid
        ? this.prisma.crmFieldMapping.findMany({
            where: { company_uuid: companyUuid, integration_uuid: integrationUuid, agent_uuid: null },
            orderBy: { created_at: 'asc' },
          })
        : Promise.resolve([] as CrmFieldMapping[]),
    ]);

    return {
      data: own.map((m) => this.toView(m)),
      ...(agentUuid && { inherited: inherited.map((m) => this.toView(m)) }),
    };
  }

  async replace(ctx: CompanyContextData, integrationUuid: string, dto: PutFieldMappingsDto, ip?: string) {
    await this.integrations.loadCrm(ctx.company_uuid, integrationUuid);
    if (dto.agent_uuid) await this.assertAgent(ctx.company_uuid, dto.agent_uuid);

    for (const m of dto.mappings) this.assertInternalField(m.internal_field);

    const scope = {
      company_uuid: ctx.company_uuid,
      integration_uuid: integrationUuid,
      agent_uuid: dto.agent_uuid ?? null,
    };

    const rows = await this.prisma.$transaction(async (tx) => {
      await tx.crmFieldMapping.deleteMany({ where: scope });
      if (dto.mappings.length) {
        await tx.crmFieldMapping.createMany({
          data: dto.mappings.map((m) => ({
            ...scope,
            internal_field: m.internal_field,
            external_object: m.external_object ?? null,
            external_field: m.external_field,
            direction: m.direction ?? MappingDirection.BOTH,
            use_for_personalization: m.use_for_personalization ?? false,
            transform: (m.transform ?? undefined) as Prisma.InputJsonValue | undefined,
          })),
        });
      }
      return tx.crmFieldMapping.findMany({ where: scope, orderBy: { created_at: 'asc' } });
    });

    await this.activity.logFor(ctx, 'crm_field_mappings.updated', 'integration', integrationUuid, {
      agent_uuid: dto.agent_uuid ?? null,
      count: rows.length,
    }, ip);
    return { data: rows.map((m) => this.toView(m)) };
  }

  private assertInternalField(field: string): void {
    const known = (Object.values(INTERNAL_CRM_FIELDS) as string[]).includes(field);
    const goal = field.startsWith(GOAL_FIELD_PREFIX) && GOAL_KEY.test(field.slice(GOAL_FIELD_PREFIX.length));
    if (!known && !goal) {
      throw new BadRequestException(`Unknown platform field "${field}"`);
    }
  }

  private async assertAgent(companyUuid: string, agentUuid: string): Promise<void> {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentUuid, company_uuid: companyUuid, deleted_at: null },
      select: { id: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');
  }

  private toView(m: CrmFieldMapping): FieldMappingEntity {
    return {
      id: m.id,
      integration_uuid: m.integration_uuid,
      agent_uuid: m.agent_uuid,
      internal_field: m.internal_field,
      external_object: m.external_object,
      external_field: m.external_field,
      direction: m.direction,
      use_for_personalization: m.use_for_personalization,
      transform: (m.transform as Record<string, any> | null) ?? null,
    };
  }
}
