import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ActorType,
  AgentStatus,
  AlertSeverity,
  AlertType,
  Call,
  CallDirection,
  CallStatus,
  Contact,
  IntegrationStatus,
  KnowledgeStatus,
  MappingDirection,
  PhoneNumberStatus,
  Prisma,
  SyncStatus,
  VoiceProvider,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AlertsService } from '@/shared/services/alerts/alerts.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import {
  BASE_PERSONALIZATION_VARIABLES,
  personalizationVariableKey,
} from '@/shared/constants/crm-fields';
import { CrmService } from '@/modules/integrations/crm/crm.service';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { CallPlacementErrorCode, CallPlacementErrorCodes } from '../call-engine.constants';
import { CallingHoursOverride, PlaceCallInput } from '../interfaces/call-engine.interface';
import { CallingHoursService } from './calling-hours.service';

interface PendingEvent {
  type: string;
  message?: string;
  data?: Record<string, any>;
}

const UNKNOWN = 'unknown';

/** Places an outbound call end to end (validation, personalization, snapshots, dialing). */
@Injectable()
export class CallPlacementService {
  private readonly logger = new Logger(CallPlacementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly voice: VoiceProviderService,
    private readonly crm: CrmService,
    private readonly callingHours: CallingHoursService,
    private readonly alerts: AlertsService,
    private readonly activity: ActivityLogService,
  ) {}

  async placeCall(input: PlaceCallInput): Promise<Call> {
    const agent = await this.prisma.agent.findFirst({
      where: { id: input.agent_uuid, company_uuid: input.company_uuid, deleted_at: null },
      include: {
        company: { select: { name: true } },
        goal_items: { orderBy: { position: 'asc' } },
        questions: { orderBy: { position: 'asc' } },
        outcomes: { orderBy: { position: 'asc' } },
        crm_tools: { include: { crm_tool: { select: { key: true, is_active: true } } } },
        knowledge_sources: { include: { source: { include: { versions: true } } } },
        provider_links: true,
        phone_numbers: { where: { status: PhoneNumberStatus.ACTIVE }, orderBy: { created_at: 'asc' } },
        retry_rule: true,
        crm_integration: { select: { id: true, status: true } },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const isTest = !!input.is_test;
    if (!isTest && agent.status !== AgentStatus.ACTIVE) {
      this.fail(CallPlacementErrorCodes.AGENT_NOT_ACTIVE, 'The agent is not active');
    }

    const link = agent.provider_links.find((l) => l.provider === VoiceProvider.RETELL);
    if (!link || link.sync_status !== SyncStatus.SYNCED) {
      try {
        await this.voice.syncAgent(agent.id);
      } catch (error) {
        this.logger.error(`Agent ${agent.id} could not be synced before dialing: ${error?.message}`);
        this.fail(CallPlacementErrorCodes.AGENT_NOT_SYNCED, 'The agent is not ready to make calls yet');
      }
    }

    const { contact, toNumber } = await this.resolveContact(input, agent.id);

    if (contact.do_not_call) {
      this.fail(CallPlacementErrorCodes.CONTACT_DO_NOT_CALL, 'This contact is marked as do-not-call');
    }

    if (!isTest) {
      const override = (agent.retry_rule?.calling_hours_override ?? null) as unknown as CallingHoursOverride | null;
      const allowed = await this.callingHours.isCallAllowed(input.company_uuid, new Date(), override);
      if (!allowed) {
        const next = await this.callingHours.nextAllowedTime(input.company_uuid, new Date(), override);
        throw new BadRequestException({
          code: CallPlacementErrorCodes.OUTSIDE_CALLING_HOURS,
          message: 'Calls are not allowed outside the configured calling hours',
          next_allowed_at: next.toISOString(),
        });
      }
    }

    const phoneNumber = agent.phone_numbers[0];
    if (!phoneNumber) {
      await this.alerts.raise({
        company_uuid: input.company_uuid,
        type: AlertType.NO_PHONE_NUMBER_AVAILABLE,
        severity: AlertSeverity.ERROR,
        title: 'No phone number available',
        message: `Agent "${agent.name}" has no active phone number to call from.`,
        entity_type: 'agent',
        entity_uuid: agent.id,
      });
      this.fail(CallPlacementErrorCodes.NO_PHONE_NUMBER_AVAILABLE, 'The agent has no phone number assigned');
    }

    const events: PendingEvent[] = [];
    await this.linkCrmRecord(input.company_uuid, agent, contact, toNumber, events);

    const fresh = await this.prisma.contact.findUnique({ where: { id: contact.id } });
    const dynamicVariables = await this.buildDynamicVariables(
      input.company_uuid,
      agent,
      fresh ?? contact,
      input.contact_name,
      events,
    );

    const call = await this.prisma.call.create({
      data: {
        company_uuid: input.company_uuid,
        agent_uuid: agent.id,
        contact_uuid: contact.id,
        phone_number_uuid: phoneNumber.id,
        scheduled_call_uuid: input.scheduled_call_uuid ?? null,
        direction: CallDirection.OUTBOUND,
        status: CallStatus.QUEUED,
        is_test: isTest,
        attempt_number: input.attempt_number ?? 1,
        from_number: phoneNumber.number,
        to_number: toNumber,
        contact_name: input.contact_name ?? contact.name ?? null,
        provider: VoiceProvider.RETELL,
        queued_at: new Date(),
        agent_snapshot: this.buildAgentSnapshot(agent),
        knowledge_snapshot: this.buildKnowledgeSnapshot(agent),
        dynamic_variables: dynamicVariables,
      },
    });

    await this.addEvents(call.id, [
      { type: 'call.requested', data: { attempt_number: call.attempt_number, is_test: isTest } },
      { type: 'call.personalized', data: { variables: Object.keys(dynamicVariables) } },
      ...events,
    ]);

    try {
      const dialed = await this.voice.createOutboundCall({
        call_uuid: call.id,
        agent_uuid: agent.id,
        from_number: phoneNumber.number,
        to_number: toNumber,
        dynamic_variables: dynamicVariables,
        metadata: { call_uuid: call.id, company_uuid: input.company_uuid, agent_uuid: agent.id },
      });

      const updated = await this.prisma.call.update({
        where: { id: call.id },
        data: {
          external_call_id: dialed.external_call_id,
          provider_agent_version: dialed.agent_version ?? null,
        },
      });
      await this.addEvents(call.id, [{ type: 'call.dialed' }]);
      await this.activity.log({
        company_uuid: input.company_uuid,
        user_uuid: input.requested_by_user_uuid ?? null,
        actor_type: input.requested_by_user_uuid ? ActorType.USER : ActorType.SYSTEM,
        action: 'call.started',
        entity_type: 'call',
        entity_uuid: call.id,
        metadata: { agent_uuid: agent.id, is_test: isTest, attempt_number: call.attempt_number },
      });
      return updated;
    } catch (error) {
      await this.handleDialFailure(call, agent.name, error);
      throw new ServiceUnavailableException({
        code: CallPlacementErrorCodes.PROVIDER_UNAVAILABLE,
        message: 'The call could not be started. Please try again shortly.',
        call_uuid: call.id,
      });
    }
  }

  private fail(code: CallPlacementErrorCode, message: string): never {
    throw new BadRequestException({ code, message });
  }

  private async resolveContact(
    input: PlaceCallInput,
    agentUuid: string,
  ): Promise<{ contact: Contact; toNumber: string }> {
    let contact: Contact | null = null;

    if (input.contact_uuid) {
      contact = await this.prisma.contact.findFirst({
        where: { id: input.contact_uuid, company_uuid: input.company_uuid },
      });
      if (!contact) this.fail(CallPlacementErrorCodes.CONTACT_NOT_FOUND, 'Contact not found');
    }

    const rawNumber = contact ? contact.phone : input.to_number;
    const toNumber = toE164(rawNumber);
    if (!toNumber) {
      await this.alerts.raise({
        company_uuid: input.company_uuid,
        type: AlertType.INVALID_PHONE_NUMBER,
        severity: AlertSeverity.WARNING,
        title: 'Invalid phone number',
        message: 'A call could not be placed because the phone number is not valid.',
        entity_type: contact ? 'contact' : 'agent',
        entity_uuid: contact ? contact.id : agentUuid,
      });
      this.fail(CallPlacementErrorCodes.INVALID_PHONE_NUMBER, 'The phone number is not valid');
    }

    if (!contact) {
      contact = await this.prisma.contact.findFirst({
        where: { company_uuid: input.company_uuid, phone: toNumber },
        orderBy: { created_at: 'asc' },
      });
      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            company_uuid: input.company_uuid,
            phone: toNumber,
            name: input.contact_name ?? null,
          },
        });
      }
    }

    return { contact, toNumber };
  }

  private async linkCrmRecord(
    companyUuid: string,
    agent: { crm_integration_uuid: string | null; crm_integration: { status: IntegrationStatus } | null },
    contact: Contact,
    toNumber: string,
    events: PendingEvent[],
  ): Promise<void> {
    if (!agent.crm_integration_uuid || contact.external_id) return;
    if (agent.crm_integration?.status !== IntegrationStatus.ACTIVE) return;

    try {
      const record = await this.crm.lookupContact(companyUuid, agent.crm_integration_uuid, {
        phone: toNumber,
      });
      if (!record) {
        events.push({ type: 'crm.contact_not_found' });
        return;
      }
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: {
          integration_uuid: agent.crm_integration_uuid,
          external_id: record.external_id,
          record_type: record.record_type,
          external_url: record.url ?? null,
          name: contact.name ?? record.name ?? null,
          email: contact.email ?? record.email ?? null,
        },
      });
      events.push({ type: 'crm.contact_linked' });
    } catch (error) {
      this.logger.warn(`CRM lookup failed before call: ${error?.message}`);
      events.push({ type: 'crm.lookup_failed', message: String(error?.message ?? '').slice(0, 300) });
    }
  }

  private async buildDynamicVariables(
    companyUuid: string,
    agent: {
      id: string;
      name: string;
      crm_integration_uuid: string | null;
      crm_integration: { status: IntegrationStatus } | null;
      company: { name: string };
    },
    contact: Contact,
    contactName: string | undefined,
    events: PendingEvent[],
  ): Promise<Record<string, string>> {
    const expected = new Set<string>(BASE_PERSONALIZATION_VARIABLES);

    if (agent.crm_integration_uuid) {
      const mappings = await this.prisma.crmFieldMapping.findMany({
        where: {
          company_uuid: companyUuid,
          integration_uuid: agent.crm_integration_uuid,
          use_for_personalization: true,
          direction: { in: [MappingDirection.READ, MappingDirection.BOTH] },
          OR: [{ agent_uuid: agent.id }, { agent_uuid: null }],
        },
        select: { internal_field: true },
      });
      for (const m of mappings) expected.add(personalizationVariableKey(m.internal_field));
    }

    const vars: Record<string, string> = {
      customer_name: contactName ?? contact.name ?? UNKNOWN,
      company_name: agent.company.name,
      agent_name: agent.name,
    };

    if (agent.crm_integration_uuid && contact.external_id && agent.crm_integration?.status === IntegrationStatus.ACTIVE) {
      try {
        const fromCrm = await this.crm.buildPersonalization({
          company_uuid: companyUuid,
          agent_uuid: agent.id,
          integration_uuid: agent.crm_integration_uuid,
          contact,
        });
        for (const [key, value] of Object.entries(fromCrm ?? {})) {
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            vars[key] = String(value);
          }
        }
      } catch (error) {
        this.logger.warn(`CRM personalization failed: ${error?.message}`);
        events.push({ type: 'crm.personalization_failed', message: String(error?.message ?? '').slice(0, 300) });
      }
    }

    for (const key of expected) {
      if (!vars[key] || vars[key].trim() === '') vars[key] = UNKNOWN;
    }
    return vars;
  }

  private buildAgentSnapshot(agent: any): Prisma.InputJsonValue {
    return JSON.parse(
      JSON.stringify({
        name: agent.name,
        description: agent.description,
        purpose: agent.purpose,
        status: agent.status,
        language: agent.language,
        voice: agent.voice,
        first_message: agent.first_message,
        instructions: agent.instructions,
        goal: agent.goal,
        success_criteria: agent.success_criteria,
        failure_criteria: agent.failure_criteria,
        max_call_duration_seconds: agent.max_call_duration_seconds,
        crm_integration_uuid: agent.crm_integration_uuid,
        personalization_config: agent.personalization_config,
        detect_voicemail: agent.detect_voicemail,
        leave_voicemail: agent.leave_voicemail,
        voicemail_message: agent.voicemail_message,
        transfer_enabled: agent.transfer_enabled,
        transfer_on_request: agent.transfer_on_request,
        transfer_on_unresolved: agent.transfer_on_unresolved,
        transfer_number: agent.transfer_number,
        transfer_fallback_message: agent.transfer_fallback_message,
        goal_items: agent.goal_items.map((g: any) => ({
          key: g.key,
          label: g.label,
          description: g.description,
          requirement: g.requirement,
          data_type: g.data_type,
          enum_values: g.enum_values,
        })),
        questions: agent.questions.map((q: any) => ({
          question: q.question,
          is_required: q.is_required,
          expected_answer: q.expected_answer,
        })),
        outcomes: agent.outcomes.map((o: any) => ({
          key: o.key,
          label: o.label,
          description: o.description,
          is_success: o.is_success,
          system_type: o.system_type,
        })),
        allowed_tool_keys: agent.crm_tools.filter((t: any) => t.crm_tool.is_active).map((t: any) => t.crm_tool.key),
      }),
    );
  }

  private buildKnowledgeSnapshot(agent: any): Prisma.InputJsonValue {
    const entries = agent.knowledge_sources
      .map((link: any) => link.source)
      .filter((s: any) => s.is_enabled && !s.deleted_at && s.status === KnowledgeStatus.READY)
      .map((s: any) => {
        const version = s.versions.find((v: any) => v.version === s.current_version);
        return {
          source_uuid: s.id,
          name: s.name,
          version: s.current_version,
          content_hash: version?.content_hash ?? null,
        };
      });
    return entries as Prisma.InputJsonValue;
  }

  private async handleDialFailure(call: Call, agentName: string, error: any): Promise<void> {
    const message = String(error?.message ?? 'Call could not be started').slice(0, 500);
    this.logger.error(`Dialing failed for call ${call.id}: ${message}`);

    await this.prisma.call
      .update({
        where: { id: call.id },
        data: {
          status: CallStatus.FAILED,
          ended_at: new Date(),
          error_code: CallPlacementErrorCodes.PROVIDER_UNAVAILABLE,
          error_message: message,
        },
      })
      .catch((e) => this.logger.error(`Failed to mark call failed: ${e?.message}`));

    await this.addEvents(call.id, [{ type: 'call.failed', message }]);

    await this.alerts.raise({
      company_uuid: call.company_uuid,
      type: AlertType.CALL_FAILED,
      severity: AlertSeverity.ERROR,
      title: 'Phone call failed to connect',
      message: `A call from agent "${agentName}" could not be started.`,
      entity_type: 'call',
      entity_uuid: call.id,
    });

    const status = error instanceof HttpException ? error.getStatus() : 500;
    if (status >= 500) {
      await this.alerts.raise({
        company_uuid: call.company_uuid,
        type: AlertType.AI_SERVICE_UNAVAILABLE,
        severity: AlertSeverity.ERROR,
        title: 'AI service temporarily unavailable',
        message: 'The calling service did not respond. Calls will work again once it recovers.',
        entity_type: 'company',
        entity_uuid: call.company_uuid,
      });
    }
  }

  private async addEvents(callUuid: string, events: PendingEvent[]): Promise<void> {
    try {
      await this.prisma.callEvent.createMany({
        data: events.map((e) => ({
          call_uuid: callUuid,
          type: e.type,
          message: e.message ?? null,
          data: e.data as Prisma.InputJsonValue | undefined,
        })),
      });
    } catch (error) {
      this.logger.error(`Failed to write call events: ${error?.message}`);
    }
  }
}
