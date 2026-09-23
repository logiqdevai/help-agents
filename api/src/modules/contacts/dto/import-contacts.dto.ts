import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsEnum, IsISO31661Alpha2, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CrmRecordType } from 'generated/prisma';
import { CreateContactDto } from './create-contact.dto';

export class ImportContactsDto {
  @ApiProperty({ type: [CreateContactDto], description: 'Up to 500 contacts per request' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts: CreateContactDto[];

  @ApiPropertyOptional({ description: 'Country used for rows whose own default_country is not set', example: 'GR' })
  @IsOptional()
  @IsISO31661Alpha2()
  default_country?: string;
}

export class SyncContactFromCrmDto {
  @ApiProperty({ description: 'CRM connection to look the record up in' })
  @IsUUID()
  integration_uuid: string;

  @ApiPropertyOptional({ description: 'Record id in the CRM' })
  @IsOptional()
  @IsString()
  external_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: CrmRecordType })
  @IsOptional()
  @IsEnum(CrmRecordType)
  record_type?: CrmRecordType;

  @ApiPropertyOptional({ example: 'GR' })
  @IsOptional()
  @IsISO31661Alpha2()
  default_country?: string;
}
