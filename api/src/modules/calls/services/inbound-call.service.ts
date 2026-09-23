import { Injectable, Logger } from '@nestjs/common';
import { Call, CallDirection, CallStatus, Contact, CrmRecordType, VoiceProvider } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CrmService } from '@/modules/integrations/crm/crm.service';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { INBOUND_CRM_TIMEOUT_MS } from '../calls.constants';
import { msToDate } from '../utils/calls.utils';
import { VoiceCallPayload } from '../interfaces/calls.interface';

interface InboundTarget {
  company_uuid: string;
  agent_uuid: string;
  phone_number_uuid: string;
  agent: { id: string; name: string; crm_integration_uuid: string | null; deleted_at: Date | null };
  company: { name: string };
}

@Injectable()
export class InboundCallService {
  private readonly logger = new Logger(InboundCallService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crm: CrmService,
  ) {}

  /** Resolves the company / agent that owns a dialed number. Null when the number isn't routed to an agent. */
  async resolveTarget(toNumber: string | undefined | null): Promise<InboundTarget | null> {
    if (!toNumber) return null;
    const number = toE164(toNumber) ?? toNumber;

    const phone = await this.prisma.phoneNumber.findUnique({
      where: { number },
      include: {
        agent: { select: { id: true, name: true, crm_integration_uuid: true, deleted_at: true } },
        company: { select: { name: true } },
      },
    });
    if (!phone || !phone.agent_uuid || !phone.agent || phone.agent.deleted_at) return null;

    return {
      company_uuid: phone.company_uuid,
      agent_uuid: phone.agent_uuid,
      phone_number_uuid: phone.id,
      agent: phone.agent,
      company: phone.company,
    };
  }

  async findOrCreateContact(companyUuid: string, fromNumber: string | undefined | null): Promise<Contact | null> {
    const phone = fromNumber ? (toE164(fromNumber) ?? fromNumber) : null;
    if (!phone) return null;

    const existing = await this.prisma.contact.findFirst({
      where: { company_uuid: companyUuid, phone },
      orderBy: { created_at: 'asc' },
    });
    if (existing) return existing;

    return this.prisma.contact.create({
      data: { company_uuid: companyUuid, phone, record_type: CrmRecordType.CONTACT },
    });
  }

  /** Creates the Call row for an inbound call we first hear about through a provider event. */
  async createInboundCall(payload: VoiceCallPayload): Promise<Call | null> {
    const target = await this.resolveTarget(payload.to_number);
    if (!target) return null;

    const contact = await this.findOrCreateContact(target.company_uuid, payload.from_number);

    try {
      return await this.prisma.call.create({
        data: {
          company_uuid: target.company_uuid,
          agent_uuid: target.agent_uuid,
          contact_uuid: contact?.id ?? null,
          phone_number_uuid: target.phone_number_uuid,
          direction: CallDirection.INBOUND,
          status: CallStatus.IN_PROGRESS,
          from_number: payload.from_number ?? null,
          to_number: payload.to_number ?? null,
          contact_name: contact?.name ?? null,
          provider: VoiceProvider.RETELL,
          external_call_id: payload.call_id,
          provider_agent_version: payload.agent_version ?? null,
          queued_at: msToDate(payload.start_timestamp) ?? new Date(),
          started_at: msToDate(payload.start_timestamp) ?? new Date(),
          answered_at: msToDate(payload.start_timestamp) ?? new Date(),
          agent_snapshot: { agent: { id: target.agent.id, name: target.agent.name }, direction: 'INBOUND' },
        },
      });
    } catch (error) {
      // Concurrent events for the same call raced to create it.
      if (error?.code === 'P2002') {
        return this.prisma.call.findFirst({
          where: { provider: VoiceProvider.RETELL, external_call_id: payload.call_id },
        });
      }
      throw error;
    }
  }

  /** Answer for the provider's inbound webhook: personalization for the caller. Never throws. */
  async buildInboundResponse(fromNumber?: string, toNumber?: string): Promise<Record<string, any>> {
    try {
      const target = await this.resolveTarget(toNumber);
      if (!target) return { call_inbound: {} };

      let contact = await this.findOrCreateContact(target.company_uuid, fromNumber);
      const variables: Record<string, string> = {
        customer_name: contact?.name || 'unknown',
        company_name: target.company.name,
        agent_name: target.agent.name,
      };

      const integrationUuid = target.agent.crm_integration_uuid;
      if (contact && integrationUuid) {
        const enriched = await this.withTimeout(
          this.enrichFromCrm(target.company_uuid, target.agent_uuid, integrationUuid, contact),
          INBOUND_CRM_TIMEOUT_MS,
        );
        if (enriched) {
          contact = enriched.contact;
          Object.assign(variables, enriched.variables);
          if (contact.name) variables.customer_name = contact.name;
        }
      }

      return {
        call_inbound: {
          dynamic_variables: variables,
          metadata: { company_uuid: target.company_uuid, agent_uuid: target.agent_uuid },
        },
      };
    } catch (error) {
      this.logger.error(`Inbound personalization failed: ${error?.message}`);
      return { call_inbound: {} };
    }
  }

  private async enrichFromCrm(
    companyUuid: string,
    agentUuid: string,
    integrationUuid: string,
    contact: Contact,
  ): Promise<{ contact: Contact; variables: Record<string, string> } | null> {
    try {
      let current = contact;

      if (!current.external_id && current.phone) {
        const record = await this.crm.lookupContact(companyUuid, integrationUuid, { phone: current.phone });
        if (record) {
          try {
            current = await this.prisma.contact.update({
              where: { id: current.id },
              data: {
                integration_uuid: integrationUuid,
                external_id: record.external_id,
                record_type: record.record_type,
                name: current.name ?? record.name ?? null,
                email: current.email ?? record.email ?? null,
                external_url: record.url ?? null,
              },
            });
          } catch (error) {
            this.logger.warn(`Could not link contact ${current.id} to its CRM record: ${error?.message}`);
          }
        }
      }

      const variables = await this.crm.buildPersonalization({
        company_uuid: companyUuid,
        agent_uuid: agentUuid,
        integration_uuid: integrationUuid,
        contact: current,
      });
      return { contact: current, variables: variables ?? {} };
    } catch (error) {
      this.logger.warn(`CRM lookup for inbound call failed: ${error?.message}`);
      return null;
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), ms);
      promise
        .then((value) => resolve(value))
        .catch(() => resolve(null))
        .finally(() => clearTimeout(timer));
    });
  }
}
