import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Contact, CrmRecordType, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { CrmService } from '@/modules/integrations/crm/crm.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ImportContactsDto, SyncContactFromCrmDto } from './dto/import-contacts.dto';
import { ContactQueryType } from './dto/contact-query.schema';

const INTEGRATION_SUMMARY = { select: { id: true, name: true, provider: true } } as const;

type ContactWithIntegration = Prisma.ContactGetPayload<{ include: { integration: typeof INTEGRATION_SUMMARY } }>;

export interface ImportRowResult {
  index: number;
  status: 'created' | 'updated' | 'failed';
  contact_uuid?: string;
  error?: string;
}

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crm: CrmService,
    private readonly activity: ActivityLogService,
  ) {}

  async findAll(companyUuid: string, query: ContactQueryType) {
    const where: Prisma.ContactWhereInput = {
      company_uuid: companyUuid,
      ...(query.integration_uuid && { integration_uuid: query.integration_uuid }),
      ...(query.record_type && { record_type: query.record_type }),
      ...(query.do_not_call !== undefined && { do_not_call: query.do_not_call }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: { integration: INTEGRATION_SUMMARY },
        orderBy: { [query.order_by]: query.order_direction },
        ...skipTake(query),
      }),
      this.prisma.contact.count({ where }),
    ]);
    return paginated(items, total, query.page, query.limit);
  }

  async findOne(companyUuid: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, company_uuid: companyUuid },
      include: { integration: INTEGRATION_SUMMARY },
    });
    if (!contact) throw new NotFoundException('Contact not found');

    const recent_calls = await this.prisma.call.findMany({
      where: { company_uuid: companyUuid, contact_uuid: id },
      select: { id: true, call_number: true, status: true, outcome_label: true, started_at: true },
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    return { ...contact, recent_calls };
  }

  async create(ctx: CompanyContextData, dto: CreateContactDto, ip?: string): Promise<ContactWithIntegration> {
    const values = await this.prepare(ctx.company_uuid, dto);
    if (!values.phone && !values.email && !values.external_id) {
      throw new BadRequestException('Provide at least a phone number, an email or a CRM reference id');
    }

    const existing = await this.findExisting(ctx.company_uuid, values);
    if (existing) throw new ConflictException('A contact with the same CRM reference or phone number already exists');

    const contact = await this.prisma.contact.create({
      data: this.toCreateData(ctx.company_uuid, values),
      include: { integration: INTEGRATION_SUMMARY },
    });
    await this.activity.logFor(ctx, 'contact.created', 'contact', contact.id, undefined, ip);
    return contact;
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdateContactDto, ip?: string): Promise<ContactWithIntegration> {
    const existing = await this.load(ctx.company_uuid, id);
    const values = await this.prepare(ctx.company_uuid, dto);

    const merged = {
      integration_uuid: values.integration_uuid !== undefined ? values.integration_uuid : existing.integration_uuid,
      external_id: values.external_id !== undefined ? values.external_id : existing.external_id,
      record_type: values.record_type ?? existing.record_type,
    };
    if (merged.integration_uuid && merged.external_id) {
      const clash = await this.prisma.contact.findFirst({
        where: { company_uuid: ctx.company_uuid, id: { not: id }, ...merged },
        select: { id: true },
      });
      if (clash) throw new ConflictException('Another contact already uses this CRM reference');
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: this.toUpdateData(values),
      include: { integration: INTEGRATION_SUMMARY },
    });

    if (dto.do_not_call !== undefined && dto.do_not_call !== existing.do_not_call) {
      await this.activity.logFor(ctx, 'contact.do_not_call_changed', 'contact', id, { do_not_call: dto.do_not_call }, ip);
    }
    await this.activity.logFor(ctx, 'contact.updated', 'contact', id, { fields: Object.keys(dto) }, ip);
    return contact;
  }

  async remove(ctx: CompanyContextData, id: string, ip?: string): Promise<{ deleted: true }> {
    await this.load(ctx.company_uuid, id);
    await this.prisma.contact.delete({ where: { id } });
    await this.activity.logFor(ctx, 'contact.deleted', 'contact', id, undefined, ip);
    return { deleted: true };
  }

  async import(ctx: CompanyContextData, dto: ImportContactsDto, ip?: string) {
    const results: ImportRowResult[] = [];

    for (const [index, row] of dto.contacts.entries()) {
      try {
        const values = await this.prepare(ctx.company_uuid, { ...row, default_country: row.default_country ?? dto.default_country });
        if (!values.phone && !values.email && !values.external_id) {
          throw new BadRequestException('Provide at least a phone number, an email or a CRM reference id');
        }
        const { action, contact } = await this.upsert(ctx.company_uuid, values);
        results.push({ index, status: action, contact_uuid: contact.id });
      } catch (error) {
        results.push({ index, status: 'failed', error: this.errorMessage(error) });
      }
    }

    const summary = {
      created: results.filter((r) => r.status === 'created').length,
      updated: results.filter((r) => r.status === 'updated').length,
      failed: results.filter((r) => r.status === 'failed').length,
    };
    await this.activity.logFor(ctx, 'contact.imported', 'contact', null, summary, ip);
    return { summary, results };
  }

  async syncFromCrm(ctx: CompanyContextData, dto: SyncContactFromCrmDto, ip?: string) {
    if (!dto.external_id && !dto.phone && !dto.email) {
      throw new BadRequestException('Provide external_id, phone or email to look up');
    }

    let phone: string | undefined;
    if (dto.phone) {
      phone = toE164(dto.phone, dto.default_country) ?? undefined;
      if (!phone) throw this.invalidPhone();
    }

    const record = await this.crm.lookupContact(ctx.company_uuid, dto.integration_uuid, {
      external_id: dto.external_id,
      phone,
      email: dto.email,
      record_type: dto.record_type,
    });
    if (!record) throw new NotFoundException('No matching record was found in the CRM');

    const current = await this.prisma.contact.findFirst({
      where: {
        company_uuid: ctx.company_uuid,
        integration_uuid: dto.integration_uuid,
        record_type: record.record_type,
        external_id: record.external_id,
      },
      select: { data: true },
    });
    const previous = current?.data && typeof current.data === 'object' && !Array.isArray(current.data) ? current.data : {};

    const { action, contact } = await this.upsert(ctx.company_uuid, {
      integration_uuid: dto.integration_uuid,
      external_id: record.external_id,
      record_type: record.record_type,
      external_url: record.url ?? undefined,
      name: record.name ?? undefined,
      phone: toE164(record.phone, dto.default_country) ?? phone,
      email: record.email ?? dto.email,
      data: { ...(previous as Record<string, any>), source: 'crm_sync', synced_at: new Date().toISOString() },
    });

    await this.activity.logFor(ctx, 'contact.synced_from_crm', 'contact', contact.id, {
      integration_uuid: dto.integration_uuid,
      action,
    }, ip);
    return this.findOne(ctx.company_uuid, contact.id);
  }

  // ------------------------------------------------------------------ internals

  private async load(companyUuid: string, id: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({ where: { id, company_uuid: companyUuid } });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  /** Validates references and normalizes the phone number to E.164. */
  private async prepare(companyUuid: string, dto: UpdateContactDto) {
    const { default_country, phone, ...rest } = dto;

    let normalizedPhone: string | null | undefined = phone as string | null | undefined;
    if (typeof phone === 'string') {
      normalizedPhone = toE164(phone, default_country);
      if (!normalizedPhone) throw this.invalidPhone();
    }

    if (rest.integration_uuid) {
      const integration = await this.prisma.integration.findFirst({
        where: { id: rest.integration_uuid, company_uuid: companyUuid },
        select: { id: true },
      });
      if (!integration) throw new NotFoundException('Integration not found');
    }

    return { ...rest, phone: normalizedPhone };
  }

  private async findExisting(
    companyUuid: string,
    values: { integration_uuid?: string | null; external_id?: string | null; record_type?: CrmRecordType; phone?: string | null },
  ): Promise<Contact | null> {
    if (values.integration_uuid && values.external_id) {
      const byKey = await this.prisma.contact.findFirst({
        where: {
          company_uuid: companyUuid,
          integration_uuid: values.integration_uuid,
          record_type: values.record_type ?? CrmRecordType.CONTACT,
          external_id: values.external_id,
        },
      });
      if (byKey) return byKey;
    }
    if (values.phone) {
      return this.prisma.contact.findFirst({ where: { company_uuid: companyUuid, phone: values.phone } });
    }
    return null;
  }

  /** Updates the matching contact (CRM key, else phone) or creates a new one. */
  private async upsert(
    companyUuid: string,
    values: Awaited<ReturnType<ContactsService['prepare']>>,
  ): Promise<{ action: 'created' | 'updated'; contact: Contact }> {
    const existing = await this.findExisting(companyUuid, values);

    if (existing) {
      const contact = await this.prisma.contact.update({ where: { id: existing.id }, data: this.toUpdateData(values) });
      return { action: 'updated', contact };
    }
    const contact = await this.prisma.contact.create({ data: this.toCreateData(companyUuid, values) });
    return { action: 'created', contact };
  }

  private toCreateData(companyUuid: string, v: Awaited<ReturnType<ContactsService['prepare']>>): Prisma.ContactUncheckedCreateInput {
    return {
      company_uuid: companyUuid,
      integration_uuid: v.integration_uuid ?? null,
      external_id: v.external_id ?? null,
      record_type: v.record_type ?? CrmRecordType.CONTACT,
      name: v.name ?? null,
      phone: v.phone ?? null,
      email: v.email ?? null,
      external_url: v.external_url ?? null,
      do_not_call: v.do_not_call ?? false,
      data: v.data as Prisma.InputJsonValue | undefined,
    };
  }

  /** Only provided fields are changed. */
  private toUpdateData(v: Awaited<ReturnType<ContactsService['prepare']>>): Prisma.ContactUncheckedUpdateInput {
    const data: Prisma.ContactUncheckedUpdateInput = {};
    if (v.integration_uuid !== undefined) data.integration_uuid = v.integration_uuid;
    if (v.external_id !== undefined) data.external_id = v.external_id;
    if (v.record_type !== undefined) data.record_type = v.record_type;
    if (v.name !== undefined) data.name = v.name;
    if (v.phone !== undefined) data.phone = v.phone;
    if (v.email !== undefined) data.email = v.email;
    if (v.external_url !== undefined) data.external_url = v.external_url;
    if (v.do_not_call !== undefined) data.do_not_call = v.do_not_call;
    if (v.data !== undefined) data.data = v.data as Prisma.InputJsonValue;
    return data;
  }

  private invalidPhone(): BadRequestException {
    return new BadRequestException({ code: 'INVALID_PHONE_NUMBER', message: 'The phone number is not valid' });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
      const res = error.getResponse() as any;
      return typeof res === 'string' ? res : (res?.message ?? error.message);
    }
    return error instanceof Error ? error.message : 'Unexpected error';
  }
}
