import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ required: false, example: 'Acme Ltd' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiProperty({ required: false, nullable: true, example: 'https://acme.com' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsUrl({ require_protocol: false })
  @MaxLength(255)
  website?: string | null;

  @ApiProperty({ required: false, nullable: true, example: '+302100000000' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @ApiProperty({ required: false, description: 'IANA timezone used for calling hours and reports', example: 'Europe/Athens' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Days call recordings are kept (applies to future calls); null keeps them until deleted',
    example: 90,
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsInt()
  @Min(1)
  @Max(3650)
  recording_retention_days?: number | null;
}
