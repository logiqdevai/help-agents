import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateJwtService } from '@/shared/utils/jwt/jwt.service';
import { AuthCompanySummary, AuthSession, AuthUser } from '../interfaces/auth.interface';

@Injectable()
export class AuthSessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: CreateJwtService,
    ) { }

    toAuthUser(user: User): AuthUser {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            timezone: user.timezone,
            language: user.language,
            role: user.role,
            email_verified: !!user.email_verified_at,
            created_at: user.created_at,
        };
    }

    async listCompanies(userId: string): Promise<AuthCompanySummary[]> {
        const memberships = await this.prisma.companyMember.findMany({
            where: { user_uuid: userId, company: { deleted_at: null } },
            include: { company: { select: { id: true, name: true } } },
            orderBy: { created_at: 'asc' },
        });

        return memberships.map((m) => ({ id: m.company.id, name: m.company.name, role: m.role }));
    }

    async createSession(user: User): Promise<AuthSession> {
        const access_token = await this.jwtService.signToken({ id: user.id, role: user.role });

        return {
            access_token,
            expires_in: this.jwtService.getExpirationTime(access_token),
            user: this.toAuthUser(user),
            companies: await this.listCompanies(user.id),
        };
    }
}
