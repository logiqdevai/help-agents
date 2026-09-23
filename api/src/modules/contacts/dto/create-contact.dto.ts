import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO31661Alpha2,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CrmRecordType } from 'generated/prisma';

export class CreateContactDto {
  @ApiPropertyOptional({ example: 'Maria Papadopoulou' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number; stored in E.164', example: '+302112345678' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ description: 'CRM connection the contact belongs to' })
  @IsOptional()
  @IsUUID()
  integration_uuid?: string;

  @ApiPropertyOptional({ description: 'Reference id of the record in the CRM' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  external_id?: string;

  @ApiPropertyOptional({ enum: CrmRecordType, default: CrmRecordType.CONTACT })
  @IsOptional()
  @IsEnum(CrmRecordType)
  record_type?: CrmRecordType;

  @ApiPropertyOptional({ description: 'Link back to the record in the CRM' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  external_url?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  do_not_call?: boolean;

  @ApiPropertyOptional({ description: 'Any other relevant details', type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country used to parse national phone numbers', example: 'GR' })
  @IsOptional()
  @IsISO31661Alpha2()
  default_country?: string;
}
