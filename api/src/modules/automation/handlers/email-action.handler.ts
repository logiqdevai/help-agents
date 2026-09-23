import { Injectable } from '@nestjs/common';
import { ActionKind, Call, CallAction, Prisma } from 'generated/prisma';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { CallActionHandler } from '@/modules/call-engine/interfaces/call-engine.interface';
import { asJson, escapeHtml, payloadOf } from './handler.utils';

@Injectable()
export class EmailActionHandler implements CallActionHandler {
  readonly kind = ActionKind.EMAIL;

  constructor(private readonly mail: ResendMailService) {}

  async execute(action: CallAction, _call: Call): Promise<Prisma.InputJsonValue> {
    const p = payloadOf(action);
    if (!p.to) throw new Error('No recipient email address available for this contact');
    if (!p.subject || !p.body) throw new Error('Email subject and body are required');

    await this.mail.sendEmail({
      to: p.to,
      from: EmailConfig.email_addresses.alert,
      subject: p.subject,
      text: p.body,
      html: `<p>${escapeHtml(String(p.body)).replace(/\n/g, '<br>')}</p>`,
    });
    return asJson({ sent_to: p.to });
  }
}
