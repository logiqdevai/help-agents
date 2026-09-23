import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IANAZone } from 'luxon';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { toE164 } from '@/shared/utils/phone/phone.utils';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthSessionService } from './auth-session.service';

@Injectable()
export class ProfileService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly session: AuthSessionService,
    ) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return {
            user: this.session.toAuthUser(user),
            companies: await this.session.listCompanies(userId),
        };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const data: Record<string, unknown> = {};

        if (dto.name !== undefined) data.name = dto.name.trim();
        if (dto.language !== undefined) data.language = dto.language.trim();

        if (dto.timezone !== undefined) {
            if (!IANAZone.isValidZone(dto.timezone)) throw new BadRequestException('Invalid timezone');
            data.timezone = dto.timezone;
        }

        if (dto.phone !== undefined) {
            const phone = dto.phone ? toE164(dto.phone) : null;
            if (dto.phone && !phone) {
                throw new BadRequestException('Invalid phone number (use international format, e.g. +306900000000)');
            }
            if (phone) {
                const owner = await this.prisma.user.findUnique({ where: { phone } });
                if (owner && owner.id !== userId) throw new ConflictException('This phone number is already in use');
            }
            data.phone = phone;
        }

        const user = await this.prisma.user.update({ where: { id: userId }, data });
        return { user: this.session.toAuthUser(user) };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const match = user.password && (await bcrypt.compare(dto.current_password, user.password));
        if (!match) throw new UnauthorizedException('Current password is incorrect');

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: await bcrypt.hash(dto.new_password, 10) },
        });

        return { message: 'Password updated successfully' };
    }
}
