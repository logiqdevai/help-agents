import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CrmTool, IntegrationProvider, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { CrmService } from '../crm/crm.service';
import { TOOL_HTTP_KEY } from '../crm/adapters/generic-api.adapter';
import { CreateCrmToolDto } from '../dto/create-crm-tool.dto';
import { UpdateCrmToolDto } from '../dto/update-crm-tool.dto';
import { CrmToolEntity } from '../entities/integration.entity';
import { IntegrationsService } from '../integrations.service';

const CUSTOM_PROVIDERS: IntegrationProvider[] = [IntegrationProvider.CUSTOM_CRM, IntegrationProvider.GENERIC_API];

@Injectable()
export class CrmToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crm: CrmService,
    private readonly integrations: IntegrationsService,
    private readonly activity: ActivityLogService,
  ) {}

  /** Only the tools of the connected CRM: platform catalogue for its provider + tools defined on the connection. */
  async list(companyUuid: string, integrationUuid: string): Promise<CrmToolEntity[]> {
    const tools = await this.crm.listToolsForIntegration(companyUuid, integrationUuid);
    return tools.map((t) => this.toView(t));
  }

  async create(ctx: CompanyContextData, integrationUuid: string, dto: CreateCrmToolDto, ip?: string): Promise<CrmToolEntity> {
    const integration = await this.loadCustom(ctx.company_uuid, integrationUuid);

    const clash = await this.prisma.crmTool.findFirst({
      where: {
        key: dto.key,
        OR: [
          { integration_uuid: integration.id },
          { provider: integration.provider, company_uuid: null, integration_uuid: null },
        ],
      },
      select: { id: true },
    });
    if (clash) throw new ConflictException(`A tool with key "${dto.key}" already exists for this connection`);

    const tool = await this.prisma.crmTool.create({
      data: {
        company_uuid: ctx.company_uuid,
        integration_uuid: integration.id,
        provider: integration.provider,
        key: dto.key,
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category ?? null,
        input_schema: this.buildSchema(dto.input_schema, dto.http),
        is_active: dto.is_active ?? true,
      },
    });

    await this.activity.logFor(ctx, 'crm_tool.created', 'crm_tool', tool.id, { integration_uuid: integration.id, key: tool.key }, ip);
    return this.toView(tool);
  }

  async update(
    ctx: CompanyContextData,
    integrationUuid: string,
    toolId: string,
    dto: UpdateCrmToolDto,
    ip?: string,
  ): Promise<CrmToolEntity> {
    const tool = await this.loadTool(ctx.company_uuid, integrationUuid, toolId);

    const data: Prisma.CrmToolUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;

    if (dto.input_schema !== undefined || dto.http !== undefined) {
      const current = (tool.input_schema ?? {}) as Record<string, any>;
      const { [TOOL_HTTP_KEY]: currentHttp, ...currentSchema } = current;
      data.input_schema = this.buildSchema(dto.input_schema ?? currentSchema, dto.http ?? currentHttp);
    }

    const updated = await this.prisma.crmTool.update({ where: { id: tool.id }, data });
    await this.activity.logFor(ctx, 'crm_tool.updated', 'crm_tool', tool.id, { key: tool.key }, ip);
    return this.toView(updated);
  }

  async remove(ctx: CompanyContextData, integrationUuid: string, toolId: string, ip?: string): Promise<{ deleted: true }> {
    const tool = await this.loadTool(ctx.company_uuid, integrationUuid, toolId);
    await this.prisma.crmTool.delete({ where: { id: tool.id } });
    await this.activity.logFor(ctx, 'crm_tool.deleted', 'crm_tool', tool.id, { key: tool.key }, ip);
    return { deleted: true };
  }

  private async loadCustom(companyUuid: string, integrationUuid: string) {
    const integration = await this.integrations.loadCrm(companyUuid, integrationUuid);
    if (!CUSTOM_PROVIDERS.includes(integration.provider)) {
      throw new BadRequestException('Tools can only be defined on custom CRM connections');
    }
    return integration;
  }

  private async loadTool(companyUuid: string, integrationUuid: string, toolId: string): Promise<CrmTool> {
    await this.loadCustom(companyUuid, integrationUuid);
    const tool = await this.prisma.crmTool.findFirst({
      where: { id: toolId, integration_uuid: integrationUuid, company_uuid: companyUuid },
    });
    if (!tool) throw new NotFoundException('Tool not found');
    return tool;
  }

  private buildSchema(schema: Record<string, any>, http: Record<string, any>): Prisma.InputJsonValue {
    if (schema.type !== 'object') throw new BadRequestException('input_schema.type must be "object"');
    const properties = schema.properties ?? {};
    if (typeof properties !== 'object' || Array.isArray(properties)) {
      throw new BadRequestException('input_schema.properties must be an object');
    }
    const required = Array.isArray(schema.required) ? schema.required.map(String) : [];
    if (!http?.path) throw new BadRequestException('http definition is required');

    return { type: 'object', properties, required, [TOOL_HTTP_KEY]: http } as Prisma.InputJsonValue;
  }

  private toView(tool: CrmTool): CrmToolEntity {
    const { [TOOL_HTTP_KEY]: http, ...schema } = ((tool.input_schema ?? {}) as Record<string, any>);
    return {
      id: tool.id,
      key: tool.key,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      input_schema: schema,
      scope: tool.integration_uuid ? 'custom' : 'platform',
      http: http ?? null,
      is_active: tool.is_active,
    };
  }
}
