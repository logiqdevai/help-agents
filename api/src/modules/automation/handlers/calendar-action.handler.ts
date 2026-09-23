import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DateTime } from 'luxon';
import { ActionKind, Call, CallAction, IntegrationProvider, Prisma } from 'generated/prisma';
import { IntegrationCredentialsService } from '@/modules/integrations/services/integration-credentials.service';
import { CallActionHandler } from '@/modules/call-engine/interfaces/call-engine.interface';
import { asJson, describeError, payloadOf } from './handler.utils';

const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

@Injectable()
export class CalendarActionHandler implements CallActionHandler {
  readonly kind = ActionKind.CALENDAR;

  constructor(private readonly credentials: IntegrationCredentialsService) {}

  async execute(action: CallAction, _call: Call): Promise<Prisma.InputJsonValue> {
    const p = payloadOf(action);

    const integration = await this.credentials.findActive(
      action.company_uuid,
      IntegrationProvider.GOOGLE_CALENDAR,
    );
    if (!integration) {
      throw new Error('No active Google Calendar integration is connected');
    }

    const start = p.start_iso ? DateTime.fromISO(p.start_iso, { zone: 'utc' }) : null;
    if (!start?.isValid) {
      throw new Error('Could not determine the event start time from the call data');
    }
    const end = start.plus({ minutes: Number(p.duration_minutes) || 30 });
    const timeZone = p.timezone || 'UTC';

    const token = await this.credentials.getAccessToken(action.company_uuid, integration.id);

    try {
      const response = await axios.post(
        EVENTS_URL,
        {
          summary: p.title,
          description: p.description ?? undefined,
          start: { dateTime: start.toUTC().toISO(), timeZone },
          end: { dateTime: end.toUTC().toISO(), timeZone },
          attendees: p.attendee_email ? [{ email: p.attendee_email }] : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15_000 },
      );
      return asJson({ event_id: response.data?.id ?? null, link: response.data?.htmlLink ?? null });
    } catch (error) {
      throw new Error(`Calendar event could not be created: ${describeError(error)}`);
    }
  }
}
