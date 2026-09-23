import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password' })
    @IsString()
    current_password: string;

    @ApiProperty({ description: 'New password (minimum 8 characters)', minLength: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    new_password: string;
}
