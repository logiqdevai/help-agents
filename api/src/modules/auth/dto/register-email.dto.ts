import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmailDto {
    @ApiProperty({ description: 'Full name', example: 'Maria Papadopoulou' })
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 8 characters)',
        example: 'password123',
        minLength: 8
    })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;

    @ApiProperty({
        description: 'Company name (required unless registering through an invitation)',
        example: 'Acme Ltd',
        required: false,
    })
    @ValidateIf((o) => !o.invitation_token)
    @IsString()
    @MinLength(1)
    @MaxLength(160)
    company_name?: string;

    @ApiProperty({ description: 'Phone number (E.164 recommended)', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(32)
    phone?: string;

    @ApiProperty({ description: 'IANA timezone of the company', example: 'Europe/Athens', required: false })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ description: 'Team invitation token: join that company instead of creating one', required: false })
    @IsOptional()
    @IsString()
    invitation_token?: string;
}
