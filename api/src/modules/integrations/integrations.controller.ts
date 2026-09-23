import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationQuerySchema, IntegrationQueryType } from './dto/integration-query.schema';
import { IntegrationEntity, ProviderInfoEntity } from './entities/integration.entity';

@ApiTags('Integrations')
@Controller('integrations')
@CompanyAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // Declared before ':id' so the literal path wins.
  @Get('providers')
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'List the apps that can be connected, with supported authentication types' })
  @ApiResponse({ status: 200, type: [ProviderInfoEntity] })
  providers() {
    return this.integrationsService.providers();
  }

  @Get()
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'List the company integrations' })
  findAll(
    @CompanyContext('company_uuid') companyUuid: string,
    @Query(new ZodValidationPipe(IntegrationQuerySchema)) query: IntegrationQueryType,
  ) {
    return this.integrationsService.findAll(companyUuid, query);
  }

  @Post()
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Connect a custom CRM or an API-key / token based app' })
  @ApiResponse({ status: 201, type: IntegrationEntity })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateIntegrationDto, @Ip() ip: string) {
    return this.integrationsService.create(ctx, dto, ip);
  }

  @Get(':id')
  @RequirePermissions(Permissions.INTEGRATIONS_READ)
  @ApiOperation({ summary: 'Get an integration (credentials are never returned)' })
  @ApiResponse({ status: 200, type: IntegrationEntity })
  findOne(@CompanyContext('company_uuid') companyUuid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.findOne(companyUuid, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Update an integration or rotate its credentials' })
  @ApiResponse({ status: 200, type: IntegrationEntity })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationDto,
    @Ip() ip: string,
  ) {
    return this.integrationsService.update(ctx, id, dto, ip);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Remove an integration' })
  remove(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string, @Ip() ip: string) {
    return this.integrationsService.remove(ctx, id, ip);
  }

  @Post(':id/test')
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Test the connection and update its status' })
  test(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string, @Ip() ip: string) {
    return this.integrationsService.test(ctx, id, ip);
  }
}
