import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailVerificationService } from '../services/email-verification.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('Email Verification')
@Controller('auth')
export class VerificationController {
    constructor(private readonly verificationService: EmailVerificationService) { }

    @Post('verify-email')
    @HttpCode(200)
    @ApiOperation({ summary: 'Verify an email address with the token from the verification email' })
    @ApiBody({ type: VerifyEmailDto })
    @ApiResponse({ status: 200, description: 'Email verified' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.verificationService.verify(dto.token);
    }

    @Post('resend-verification')
    @HttpCode(200)
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Resend the verification email to the current user' })
    resendVerification(@CurrentUser('id') userId: string) {
        return this.verificationService.resend(userId);
    }
}
