import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ required: false, example: 'Maria Papadopoulou' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    name?: string;

    @ApiProperty({ required: false, description: 'Phone number', example: '+306900000000' })
    @IsOptional()
    @IsString()
    @MaxLength(32)
    phone?: string;

    @ApiProperty({ required: false, description: 'IANA timezone', example: 'Europe/Athens' })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ required: false, description: 'Interface language (BCP 47)', example: 'en' })
    @IsOptional()
    @IsString()
    @MaxLength(16)
    language?: string;
}
