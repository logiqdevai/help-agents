import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CRM_TOOL_CATALOGUE } from './crm-tool-catalogue';

/** Keeps the platform CRM tool catalogue (company_uuid = null, integration_uuid = null) in sync. */
@Injectable()
export class CrmToolSeederService implements OnModuleInit {
  private readonly logger = new Logger(CrmToolSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      this.logger.error(`CRM tool catalogue seeding failed: ${error?.message}`);
    }
  }

  async seed(): Promise<void> {
    for (const tool of CRM_TOOL_CATALOGUE) {
      const where = { provider: tool.provider, key: tool.key, company_uuid: null, integration_uuid: null };
      const data = {
        name: tool.name,
        description: tool.description,
        category: tool.category,
        input_schema: tool.input_schema as Prisma.InputJsonValue,
        is_active: true,
      };

      const updated = await this.prisma.crmTool.updateMany({ where, data });
      if (updated.count === 0) {
        await this.prisma.crmTool.create({ data: { ...where, ...data } });
      }
    }
  }
}
