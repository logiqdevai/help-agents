import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EmailAuthService } from '../services/email.service';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { LoginEmailDto } from '../dto/login-email.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthResponse } from '../entities/auth-response.entity';
import { WaitlistDto } from '../dto/waitlist.dto';

@ApiTags('Email Authentication')
@Controller('auth/email')
export class EmailAuthController {
    constructor(private readonly authService: EmailAuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a user and create their company (or join one via invitation)' })
    @ApiBody({ type: RegisterEmailDto })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponse
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User with this email already exists'
    })
    registerWithEmail(@Body() dto: RegisterEmailDto) {
        return this.authService.registerWithEmail(dto);
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login user with email and password' })
    @ApiBody({ type: LoginEmailDto })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: AuthResponse
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    loginWithEmail(@Body() dto: LoginEmailDto) {
        return this.authService.loginWithEmail(dto);
    }

    @Post('/waitlist')
    @HttpCode(200)
    @ApiOperation({ summary: 'Add an email to the waitlist' })
    @ApiBody({ type: WaitlistDto })
    @ApiResponse({
        status: 200,
        description: 'Added to the waitlist',
    })
    waitlist(@Body() dto: WaitlistDto) {
        return this.authService.waitlist(dto);
    }
}
