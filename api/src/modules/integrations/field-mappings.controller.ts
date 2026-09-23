import { Body, Controller, Get, Ip, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrmRecordType } from 'generated/prisma';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { FieldMappingsService } from './services/field-mappings.service';
import { PutFieldMappingsDto } from './dto/field-mappings.dto';
import {
  CrmFieldsQuerySchema,
  CrmFieldsQueryType,
  FieldMappingsQuerySchema,
  FieldMappingsQueryType,
} from './dto/integration-query.schema';

@ApiTags('Integrations - Field mappings')
@Controller('integrations')
@CompanyAuth()
export class FieldMappingsController {
  constructor(private readonly mappingsService: FieldMappingsService) {}

  @Get('crm/internal-fields')
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'Platform-side fields that can be mapped to CRM fields' })
  internalFields() {
    return this.mappingsService.internalFields();
  }

  @Get(':id/crm-fields')
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: "Fields of the connected CRM, for the mapping screen" })
  async crmFields(
    @CompanyContext('company_uuid') companyUuid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(CrmFieldsQuerySchema)) query: CrmFieldsQueryType,
  ) {
    return { data: await this.mappingsService.crmFields(companyUuid, id, query.record_type as CrmRecordType) };
  }

  @Get(':id/field-mappings')
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'Field mappings of a connection, or of one agent when agent_uuid is given' })
  getMappings(
    @CompanyContext('company_uuid') companyUuid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(FieldMappingsQuerySchema)) query: FieldMappingsQueryType,
  ) {
    return this.mappingsService.get(companyUuid, id, query.agent_uuid);
  }

  @Put(':id/field-mappings')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Replace the field mappings of a connection (or of one agent)' })
  putMappings(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PutFieldMappingsDto,
    @Ip() ip: string,
  ) {
    return this.mappingsService.replace(ctx, id, dto, ip);
  }
}
