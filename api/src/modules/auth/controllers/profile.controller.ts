import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('auth')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get('me')
    @ApiOperation({ summary: 'Current user profile and the companies they belong to' })
    getProfile(@CurrentUser('id') userId: string) {
        return this.profileService.getProfile(userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update profile settings (name, phone, timezone, language)' })
    updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
        return this.profileService.updateProfile(userId, dto);
    }

    @Post('change-password')
    @HttpCode(200)
    @ApiOperation({ summary: 'Change the password of the current user' })
    @ApiResponse({ status: 401, description: 'Current password is incorrect' })
    changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
        return this.profileService.changePassword(userId, dto);
    }

    @Post('logout')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Log out',
        description:
            'Tokens are stateless, so this simply acknowledges the logout; the client discards its token. ' +
            'The same account can be logged in on any number of devices at once.',
    })
    logout() {
        return { message: 'Logged out' };
    }
}
