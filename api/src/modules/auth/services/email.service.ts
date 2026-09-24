import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { IANAZone } from 'luxon';
import * as bcrypt from 'bcrypt';
import { CompanyRole, ActorType } from 'generated/prisma';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { LoginEmailDto } from '../dto/login-email.dto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AuthRoles } from '../interfaces/auth.interface';
import { WaitlistDto } from '../dto/waitlist.dto';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { AuthSessionService } from './auth-session.service';
import { EmailVerificationService } from './email-verification.service';

const DEFAULT_CALLING_DAYS = [0, 1, 2, 3, 4, 5, 6].map((day_of_week) => ({
    day_of_week,
    start_time: '09:00',
    end_time: '18:00',
    is_enabled: day_of_week >= 1 && day_of_week <= 5,
}));

@Injectable()
export class EmailAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly session: AuthSessionService,
        private readonly mailService: ResendMailService,
        private readonly verification: EmailVerificationService,
        private readonly activity: ActivityLogService,
    ) { }

    async registerWithEmail(dto: RegisterEmailDto) {
        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        // Waitlist sign-ups have an empty password and may claim the account here.
        if (existingUser && existingUser.password) {
            throw new ConflictException('User with this email already exists');
        }

        const phone = dto.phone ? this.normalizePhone(dto.phone) : null;
        if (phone) {
            const phoneOwner = await this.prisma.user.findUnique({ where: { phone } });
            if (phoneOwner && phoneOwner.id !== existingUser?.id) {
                throw new ConflictException('This phone number is already in use');
            }
        }

        const timezone = dto.timezone ? this.assertTimezone(dto.timezone) : 'UTC';
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        if (dto.invitation_token) {
            return this.registerFromInvitation(dto, email, phone, hashedPassword, existingUser?.id);
        }

        const { user, company } = await this.prisma.$transaction(async (tx) => {
            const userData = {
                email,
                password: hashedPassword,
                name: dto.name.trim(),
                phone,
                timezone,
                role: AuthRoles.USER,
            };
            const user = existingUser
                ? await tx.user.update({ where: { id: existingUser.id }, data: userData })
                : await tx.user.create({ data: userData });

            const company = await tx.company.create({
                data: {
                    name: dto.company_name!.trim(),
                    timezone,
                    members: { create: { user_uuid: user.id, role: CompanyRole.OWNER } },
                    calling_hours: { create: DEFAULT_CALLING_DAYS },
                },
            });

            return { user, company };
        });

        await this.activity.log({
            company_uuid: company.id,
            user_uuid: user.id,
            actor_type: ActorType.USER,
            action: 'company.created',
            entity_type: 'company',
            entity_uuid: company.id,
            metadata: { name: company.name },
        });

        this.verification.sendVerificationEmail(user);

        return this.session.createSession(user);
    }

    private async registerFromInvitation(
        dto: RegisterEmailDto,
        email: string,
        phone: string | null,
        hashedPassword: string,
        existingUserId?: string,
    ) {
        const invitation = await this.prisma.companyInvitation.findUnique({
            where: { token_hash: createHash('sha256').update(dto.invitation_token!).digest('hex') },
            include: { company: { select: { deleted_at: true } } },
        });

        if (
            !invitation ||
            invitation.accepted_at ||
            invitation.revoked_at ||
            invitation.expires_at < new Date() ||
            invitation.company.deleted_at ||
            invitation.email.toLowerCase() !== email
        ) {
            throw new BadRequestException('Invalid or expired invitation');
        }

        const user = await this.prisma.$transaction(async (tx) => {
            const userData = {
                email,
                password: hashedPassword,
                name: dto.name.trim(),
                phone,
                role: AuthRoles.USER,
                // The invitation was delivered to this address, which proves ownership.
                email_verified_at: new Date(),
            };
            const user = existingUserId
                ? await tx.user.update({ where: { id: existingUserId }, data: userData })
                : await tx.user.create({ data: userData });

            await tx.companyMember.upsert({
                where: { company_uuid_user_uuid: { company_uuid: invitation.company_uuid, user_uuid: user.id } },
                update: {},
                create: { company_uuid: invitation.company_uuid, user_uuid: user.id, role: invitation.role },
            });
            await tx.companyInvitation.update({
                where: { id: invitation.id },
                data: { accepted_at: new Date() },
            });
            return user;
        });

        await this.activity.log({
            company_uuid: invitation.company_uuid,
            user_uuid: user.id,
            actor_type: ActorType.USER,
            action: 'team.invitation_accepted',
            entity_type: 'company_invitation',
            entity_uuid: invitation.id,
            metadata: { role: invitation.role },
        });

        return this.session.createSession(user);
    }

    async loginWithEmail(dto: LoginEmailDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.trim().toLowerCase() },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const password_match = await bcrypt.compare(dto.password, user.password);
        if (!password_match) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
        });

        return this.session.createSession(updated);
    }

    async waitlist(dto: WaitlistDto) {
        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { message: 'You are already in the waitlist', code: 'WAITLIST_ALREADY_EXISTS' };
        }

        try {
            await this.prisma.user.create({
                data: { email, password: '', role: AuthRoles.USER },
            });

            await this.mailService.sendEmail({
                to: email,
                from: EmailConfig.email_addresses.alert,
                subject: EmailConfig.templates.waitlist.subject,
                template_id: EmailConfig.templates.waitlist.template_id,
            });

            return { message: 'You have been successfully added to the waitlist', code: 'WAITLIST_SUCCESS' };
        } catch (error) {
            throw new BadRequestException('Failed to waitlist user');
        }
    }

    private normalizePhone(raw: string): string {
        const phone = toE164(raw);
        if (!phone) throw new BadRequestException('Invalid phone number (use international format, e.g. +306900000000)');
        return phone;
    }

    private assertTimezone(zone: string): string {
        if (!IANAZone.isValidZone(zone)) throw new BadRequestException('Invalid timezone');
        return zone;
    }
}
