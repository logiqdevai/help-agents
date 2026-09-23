import { Injectable } from '@nestjs/common';
import { ActionKind, Call, CallAction, Prisma } from 'generated/prisma';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { CallActionHandler } from '@/modules/call-engine/interfaces/call-engine.interface';
import { asJson, payloadOf } from './handler.utils';

@Injectable()
export class SmsActionHandler implements CallActionHandler {
  readonly kind = ActionKind.MESSAGING;

  constructor(private readonly sms: TwillioSmsService) {}

  async execute(action: CallAction, _call: Call): Promise<Prisma.InputJsonValue> {
    const p = payloadOf(action);
    const to = toE164(p.to);
    if (!to) throw new Error('No valid phone number available for this contact');
    if (!p.body) throw new Error('SMS body is required');

    try {
      const message = await this.sms.sendSms({ to, body: p.body });
      return asJson({ sent_to: to, message_id: message?.sid ?? null });
    } catch (error) {
      throw new Error(`SMS could not be sent: ${error?.message ?? 'unknown error'}`.slice(0, 300));
    }
  }
}
