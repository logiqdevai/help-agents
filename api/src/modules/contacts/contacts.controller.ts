import { Body, Controller, Delete, Get, Ip, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ImportContactsDto, SyncContactFromCrmDto } from './dto/import-contacts.dto';
import { ContactQuerySchema, ContactQueryType } from './dto/contact-query.schema';
import { ContactEntity } from './entities/contact.entity';

@ApiTags('Contacts')
@Controller('contacts')
@CompanyAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions(Permissions.CONTACTS_READ)
  @ApiOperation({ summary: 'List call targets' })
  findAll(
    @CompanyContext('company_uuid') companyUuid: string,
    @Query(new ZodValidationPipe(ContactQuerySchema)) query: ContactQueryType,
  ) {
    return this.contactsService.findAll(companyUuid, query);
  }

  @Post()
  @RequirePermissions(Permissions.CONTACTS_WRITE)
  @ApiOperation({ summary: 'Create a contact' })
  @ApiResponse({ status: 201, type: ContactEntity })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateContactDto, @Ip() ip: string) {
    return this.contactsService.create(ctx, dto, ip);
  }

  // Literal paths before ':id'.
  @Post('import')
  @RequirePermissions(Permissions.CONTACTS_WRITE)
  @ApiOperation({ summary: 'Bulk create/update contacts (up to 500), with per-row results' })
  import(@CompanyContext() ctx: CompanyContextData, @Body() dto: ImportContactsDto, @Ip() ip: string) {
    return this.contactsService.import(ctx, dto, ip);
  }

  @Post('sync-from-crm')
  @RequirePermissions(Permissions.CONTACTS_WRITE)
  @ApiOperation({ summary: 'Look a record up in the CRM and create/update the matching contact' })
  syncFromCrm(@CompanyContext() ctx: CompanyContextData, @Body() dto: SyncContactFromCrmDto, @Ip() ip: string) {
    return this.contactsService.syncFromCrm(ctx, dto, ip);
  }

  @Get(':id')
  @RequirePermissions(Permissions.CONTACTS_READ)
  @ApiOperation({ summary: 'Get a contact with its recent calls' })
  findOne(@CompanyContext('company_uuid') companyUuid: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.findOne(companyUuid, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.CONTACTS_WRITE)
  @ApiOperation({ summary: 'Update a contact (including the do-not-call flag)' })
  @ApiResponse({ status: 200, type: ContactEntity })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @Ip() ip: string,
  ) {
    return this.contactsService.update(ctx, id, dto, ip);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.CONTACTS_WRITE)
  @ApiOperation({ summary: 'Delete a contact' })
  remove(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string, @Ip() ip: string) {
    return this.contactsService.remove(ctx, id, ip);
  }
}
