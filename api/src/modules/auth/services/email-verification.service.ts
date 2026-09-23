import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateJwtService } from '@/shared/utils/jwt/jwt.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { AppUrls } from '@/shared/config/app-urls';

const VERIFY_PURPOSE = 'verify_email';
const VERIFY_TOKEN_TTL = '2d';

@Injectable()
export class EmailVerificationService {
    private readonly logger = new Logger(EmailVerificationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: CreateJwtService,
        private readonly mailService: ResendMailService,
    ) { }

    /** Fire-and-forget: registration must not fail because an email couldn't be sent. */
    sendVerificationEmail(user: { id: string; email: string }): void {
        setImmediate(async () => {
            try {
                const token = await this.jwtService.signToken(
                    { id: user.id, email: user.email, purpose: VERIFY_PURPOSE },
                    VERIFY_TOKEN_TTL,
                );
                await this.mailService.sendEmail({
                    to: user.email,
                    from: EmailConfig.email_addresses.verification,
                    subject: EmailConfig.templates.email_verification.subject,
                    template_id: EmailConfig.templates.email_verification.template_id,
                    dynamic_template_data: { verifyUrl: AppUrls.verifyEmail(token) },
                });
            } catch (error) {
                this.logger.error(`Failed to send verification email: ${error?.message}`);
            }
        });
    }

    async resend(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        if (user.email_verified_at) {
            return { message: 'Email is already verified' };
        }

        this.sendVerificationEmail(user);
        return { message: 'Verification email sent' };
    }

    async verify(token: string) {
        let payload: { id?: string; email?: string; purpose?: string };
        try {
            payload = await this.jwtService.verifyToken(token);
        } catch {
            throw new BadRequestException('Invalid or expired verification token');
        }

        if (payload?.purpose !== VERIFY_PURPOSE || !payload.id) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
        if (!user || user.email !== payload.email) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        if (!user.email_verified_at) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { email_verified_at: new Date() },
            });
        }

        return { message: 'Email verified successfully' };
    }
}
