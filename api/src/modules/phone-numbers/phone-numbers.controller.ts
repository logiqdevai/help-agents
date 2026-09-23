import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { PhoneNumbersService } from './phone-numbers.service';
import { ProvisionPhoneNumberDto } from './dto/provision-phone-number.dto';
import { ImportPhoneNumberDto } from './dto/import-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { AssignAgentDto } from './dto/assign-agent.dto';
import { PhoneNumbersQuerySchema, PhoneNumbersQueryType } from './dto/phone-numbers-query.schema';
import { PhoneNumber } from './entities/phone-number.entity';

@ApiTags('Phone Numbers')
@Controller('phone-numbers')
@CompanyAuth()
export class PhoneNumbersController {
  constructor(private readonly phoneNumbers: PhoneNumbersService) {}

  @Get()
  @RequirePermissions(Permissions.PHONE_NUMBERS_READ)
  @ApiOperation({ summary: 'List phone numbers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'agent_uuid', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Paginated phone numbers' })
  findAll(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(PhoneNumbersQuerySchema)) query: PhoneNumbersQueryType,
  ) {
    return this.phoneNumbers.findAll(ctx, query);
  }

  @Get(':id')
  @RequirePermissions(Permissions.PHONE_NUMBERS_READ)
  @ApiOperation({ summary: 'Get a phone number' })
  @ApiResponse({ status: 200, type: PhoneNumber })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.phoneNumbers.findOne(ctx, id);
  }

  @Post('provision')
  @RequirePermissions(Permissions.PHONE_NUMBERS_MANAGE)
  @ApiOperation({ summary: 'Get a new phone number provisioned by the platform' })
  @ApiResponse({ status: 201, type: PhoneNumber })
  provision(@CompanyContext() ctx: CompanyContextData, @Body() dto: ProvisionPhoneNumberDto) {
    return this.phoneNumbers.provision(ctx, dto);
  }

  @Post('import')
  @RequirePermissions(Permissions.PHONE_NUMBERS_MANAGE)
  @ApiOperation({ summary: 'Connect a phone number you already own' })
  @ApiResponse({ status: 201, type: PhoneNumber })
  importOwn(@CompanyContext() ctx: CompanyContextData, @Body() dto: ImportPhoneNumberDto) {
    return this.phoneNumbers.importOwn(ctx, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.PHONE_NUMBERS_MANAGE)
  @ApiOperation({ summary: 'Update a phone number label' })
  @ApiResponse({ status: 200, type: PhoneNumber })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhoneNumberDto,
  ) {
    return this.phoneNumbers.update(ctx, id, dto);
  }

  @Put(':id/agent')
  @RequirePermissions(Permissions.PHONE_NUMBERS_MANAGE)
  @ApiOperation({ summary: 'Assign the number to an agent, or unassign it with agent_uuid = null' })
  @ApiResponse({ status: 200, type: PhoneNumber })
  assignAgent(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAgentDto,
  ) {
    return this.phoneNumbers.assignAgent(ctx, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.PHONE_NUMBERS_MANAGE)
  @ApiOperation({ summary: 'Release a phone number' })
  @ApiResponse({ status: 200, description: 'Phone number released' })
  release(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.phoneNumbers.release(ctx, id);
  }
}
