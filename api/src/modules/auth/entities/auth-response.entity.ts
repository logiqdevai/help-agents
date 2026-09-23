import { ApiProperty } from '@nestjs/swagger';

export class AuthUserEntity {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ nullable: true })
    name: string | null;

    @ApiProperty({ nullable: true })
    phone: string | null;

    @ApiProperty({ nullable: true, example: 'Europe/Athens' })
    timezone: string | null;

    @ApiProperty({ nullable: true, example: 'en' })
    language: string | null;

    @ApiProperty({ example: 'USER' })
    role: string;

    @ApiProperty()
    email_verified: boolean;

    @ApiProperty()
    created_at: Date;
}

export class AuthCompanyEntity {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ example: 'OWNER' })
    role: string;
}

export class AuthResponse {
    @ApiProperty({
        description: 'JWT access token for authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    access_token: string;

    @ApiProperty({ description: 'Token expiry as a unix timestamp (seconds)' })
    expires_in: number;

    @ApiProperty({ type: AuthUserEntity })
    user: AuthUserEntity;

    @ApiProperty({ type: [AuthCompanyEntity], description: 'Companies the user belongs to' })
    companies: AuthCompanyEntity[];
}
