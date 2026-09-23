import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { ActorType, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { CompanyContextData } from '@/shared/decorators/company.decorator';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { EmailConfig } from '@/shared/constants/email';
import { AppUrls } from '@/shared/config/app-urls';
import { canManageRole } from '../utils/team-policy.utils';
import { CreateInvitationDto } from '../dto/team.dto';
import { InvitationsQueryType } from '../dto/team-query.schema';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
    private readonly mail: ResendMailService,
  ) {}

  async create(ctx: CompanyContextData, dto: CreateInvitationDto, ip?: string) {
    if (!canManageRole(ctx.role, dto.role)) throw new ForbiddenException('You cannot invite people with this role');

    const email = dto.email.trim().toLowerCase();

    const existingMember = await this.prisma.companyMember.findFirst({
      where: { company_uuid: ctx.company_uuid, user: { email } },
    });
    if (existingMember) throw new ConflictException('This person is already a member of the company');

    const token = randomBytes(32).toString('hex');
    const invitation = await this.prisma.$transaction(async (tx) => {
      await tx.companyInvitation.updateMany({
        where: { company_uuid: ctx.company_uuid, email, accepted_at: null, revoked_at: null },
        data: { revoked_at: new Date() },
      });
      return tx.companyInvitation.create({
        data: {
          company_uuid: ctx.company_uuid,
          email,
          role: dto.role,
          token_hash: hashToken(token),
          invited_by_uuid: ctx.user_uuid,
          expires_at: new Date(Date.now() + INVITATION_TTL_MS),
        },
      });
    });

    const email_sent = await this.sendInvitationEmail(ctx, invitation.email, invitation.role, token);

    await this.activity.logFor(ctx, 'team.member_invited', 'company_invitation', invitation.id, {
      email,
      role: invitation.role,
    }, ip);

    return { ...this.toResponse(invitation), email_sent };
  }

  async list(ctx: CompanyContextData, query: InvitationsQueryType) {
    const now = new Date();
    const statusFilter: Record<string, Prisma.CompanyInvitationWhereInput> = {
      pending: { accepted_at: null, revoked_at: null, expires_at: { gt: now } },
      accepted: { accepted_at: { not: null } },
      revoked: { revoked_at: { not: null }, accepted_at: null },
      expired: { accepted_at: null, revoked_at: null, expires_at: { lte: now } },
      all: {},
    };
    const where: Prisma.CompanyInvitationWhereInput = {
      company_uuid: ctx.company_uuid,
      ...statusFilter[query.status],
    };

    const [items, total] = await Promise.all([
      this.prisma.companyInvitation.findMany({
        where,
        ...skipTake(query),
        orderBy: { created_at: 'desc' },
        include: { invited_by: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.companyInvitation.count({ where }),
    ]);

    const data = items.map((i) => ({ ...this.toResponse(i), invited_by: i.invited_by }));
    return paginated(data, total, query.page, query.limit);
  }

  async revoke(ctx: CompanyContextData, invitationId: string, ip?: string) {
    const invitation = await this.findPending(ctx.company_uuid, invitationId);
    if (!canManageRole(ctx.role, invitation.role)) throw new ForbiddenException('You cannot revoke this invitation');

    await this.prisma.companyInvitation.update({
      where: { id: invitation.id },
      data: { revoked_at: new Date() },
    });
    await this.activity.logFor(ctx, 'team.invitation_revoked', 'company_invitation', invitation.id, { email: invitation.email }, ip);

    return { message: 'Invitation revoked' };
  }

  async resend(ctx: CompanyContextData, invitationId: string, ip?: string) {
    const invitation = await this.findPending(ctx.company_uuid, invitationId, true);
    if (!canManageRole(ctx.role, invitation.role)) throw new ForbiddenException('You cannot resend this invitation');

    const token = randomBytes(32).toString('hex');
    const updated = await this.prisma.companyInvitation.update({
      where: { id: invitation.id },
      data: { token_hash: hashToken(token), expires_at: new Date(Date.now() + INVITATION_TTL_MS) },
    });

    const email_sent = await this.sendInvitationEmail(ctx, updated.email, updated.role, token);
    await this.activity.logFor(ctx, 'team.invitation_resent', 'company_invitation', updated.id, { email: updated.email }, ip);

    return { ...this.toResponse(updated), email_sent };
  }

  /** Public: lets the invite page show who invited whom before login / registration. */
  async preview(token: string) {
    const invitation = await this.prisma.companyInvitation.findUnique({
      where: { token_hash: hashToken(token) },
      include: { company: { select: { name: true, deleted_at: true } } },
    });

    if (!invitation || !this.isUsable(invitation) || invitation.company.deleted_at) {
      throw new NotFoundException('Invitation not found or expired');
    }

    const account = await this.prisma.user.findUnique({
      where: { email: invitation.email },
      select: { password: true },
    });

    return {
      company_name: invitation.company.name,
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expires_at,
      account_exists: !!account?.password,
    };
  }

  async accept(userUuid: string, token: string) {
    const invitation = await this.prisma.companyInvitation.findUnique({
      where: { token_hash: hashToken(token) },
      include: { company: { select: { id: true, name: true, deleted_at: true } } },
    });

    if (!invitation || !this.isUsable(invitation) || invitation.company.deleted_at) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userUuid } });
    if (!user) throw new NotFoundException('User not found');
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    await this.prisma.$transaction([
      this.prisma.companyMember.upsert({
        where: { company_uuid_user_uuid: { company_uuid: invitation.company_uuid, user_uuid: user.id } },
        update: {},
        create: { company_uuid: invitation.company_uuid, user_uuid: user.id, role: invitation.role },
      }),
      this.prisma.companyInvitation.update({
        where: { id: invitation.id },
        data: { accepted_at: new Date() },
      }),
      ...(user.email_verified_at
        ? []
        : [this.prisma.user.update({ where: { id: user.id }, data: { email_verified_at: new Date() } })]),
    ]);

    await this.activity.log({
      company_uuid: invitation.company_uuid,
      user_uuid: user.id,
      actor_type: ActorType.USER,
      action: 'team.invitation_accepted',
      entity_type: 'company_invitation',
      entity_uuid: invitation.id,
      metadata: { role: invitation.role },
    });

    return { company: { id: invitation.company.id, name: invitation.company.name }, role: invitation.role };
  }

  private isUsable(invitation: { accepted_at: Date | null; revoked_at: Date | null; expires_at: Date }) {
    return !invitation.accepted_at && !invitation.revoked_at && invitation.expires_at > new Date();
  }

  private async findPending(companyUuid: string, id: string, allowExpired = false) {
    const invitation = await this.prisma.companyInvitation.findFirst({
      where: { id, company_uuid: companyUuid, accepted_at: null, revoked_at: null },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (!allowExpired && invitation.expires_at <= new Date()) throw new BadRequestException('Invitation has expired');
    return invitation;
  }

  private async sendInvitationEmail(
    ctx: CompanyContextData,
    to: string,
    role: string,
    token: string,
  ): Promise<boolean> {
    try {
      const [company, inviter] = await Promise.all([
        this.prisma.company.findUnique({ where: { id: ctx.company_uuid }, select: { name: true } }),
        this.prisma.user.findUnique({ where: { id: ctx.user_uuid }, select: { name: true, email: true } }),
      ]);

      await this.mail.sendEmail({
        to,
        from: EmailConfig.email_addresses.alert,
        subject: EmailConfig.templates.team_invitation.subject,
        template_id: EmailConfig.templates.team_invitation.template_id,
        dynamic_template_data: {
          companyName: company?.name,
          inviterName: inviter?.name ?? inviter?.email,
          role,
          acceptUrl: AppUrls.acceptInvitation(token),
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invitation email: ${error?.message}`);
      return false;
    }
  }

  private toResponse(invitation: {
    id: string;
    email: string;
    role: string;
    expires_at: Date;
    accepted_at: Date | null;
    revoked_at: Date | null;
    created_at: Date;
  }) {
    const status = invitation.accepted_at
      ? 'accepted'
      : invitation.revoked_at
        ? 'revoked'
        : invitation.expires_at <= new Date()
          ? 'expired'
          : 'pending';

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
    };
  }
}
