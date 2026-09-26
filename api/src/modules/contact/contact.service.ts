import { Injectable } from '@nestjs/common';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { buildContactEmailHtml, buildContactEmailSubject, buildContactEmailText } from './utils/contact-email.utils';

const SUCCESS_RESPONSE = { message: 'Thanks, we will be in touch soon.' };

@Injectable()
export class ContactService {
    constructor(private readonly mailService: ResendMailService) {}

    async create(dto: CreateContactRequestDto) {
        // Bots fill the hidden field; pretend it worked so they do not retry.
        if (dto.website?.trim()) return SUCCESS_RESPONSE;

        // Awaited on purpose: this email is the only record of the inquiry, so a failure must reach the visitor.
        await this.mailService.sendEmail({
            to: EmailConfig.email_addresses.contact_recipient,
            from: EmailConfig.email_addresses.alert,
            replyTo: dto.email.trim(),
            subject: buildContactEmailSubject(dto),
            text: buildContactEmailText(dto),
            html: buildContactEmailHtml(dto),
        });

        return SUCCESS_RESPONSE;
    }
}
