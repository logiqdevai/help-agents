import { Body, Controller, Delete, Get, Ip, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { CrmToolsService } from './services/crm-tools.service';
import { CreateCrmToolDto } from './dto/create-crm-tool.dto';
import { UpdateCrmToolDto } from './dto/update-crm-tool.dto';
import { CrmToolsQuerySchema, CrmToolsQueryType } from './dto/integration-query.schema';
import { CrmToolEntity } from './entities/integration.entity';

@ApiTags('Integrations - CRM tools')
@Controller('integrations/:id/crm-tools')
@CompanyAuth()
export class CrmToolsController {
  constructor(private readonly toolsService: CrmToolsService) {}

  @Get()
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'Tools (actions) available for this CRM connection' })
  @ApiResponse({ status: 200, type: [CrmToolEntity] })
  list(
    @CompanyContext('company_uuid') companyUuid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(CrmToolsQuerySchema)) query: CrmToolsQueryType,
  ) {
    return this.toolsService.list(companyUuid, id, query.include_inactive).then((data) => ({ data }));
  }

  @Post()
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Define a tool on a custom CRM connection' })
  @ApiResponse({ status: 201, type: CrmToolEntity })
  create(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCrmToolDto,
    @Ip() ip: string,
  ) {
    return this.toolsService.create(ctx, id, dto, ip);
  }

  @Patch(':toolId')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Update a custom tool' })
  @ApiResponse({ status: 200, type: CrmToolEntity })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @Body() dto: UpdateCrmToolDto,
    @Ip() ip: string,
  ) {
    return this.toolsService.update(ctx, id, toolId, dto, ip);
  }

  @Delete(':toolId')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Delete a custom tool' })
  remove(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @Ip() ip: string,
  ) {
    return this.toolsService.remove(ctx, id, toolId, ip);
  }
}
