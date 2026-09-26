import { EmailTemplates } from '@/integrations/notifications/resend/interfaces/mail.interfaces';

export const EmailConfig = {
    email_addresses: {
        verification: 'info@logiqdev.com',
        alert: 'info@logiqdev.com',
        contact_recipient: 'info@logiqdev.com',
    },
    templates: {
        waitlist: {
            subject: 'Sentify - Waitlist',
            template_id: EmailTemplates.WAITLIST,
        },
        password_reset: {
            subject: 'Reset your password',
            template_id: EmailTemplates.PASSWORD_RESET,
        },
        email_verification: {
            subject: 'Verify your email address',
            template_id: EmailTemplates.EMAIL_VERIFICATION,
        },
        team_invitation: {
            subject: 'You have been invited to join a team',
            template_id: EmailTemplates.TEAM_INVITATION,
        },
    }
}
