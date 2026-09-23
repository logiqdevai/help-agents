import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MappingDirection } from 'generated/prisma';

export class FieldMappingItemDto {
  @ApiProperty({ description: 'Platform field (e.g. call_outcome) or goal.<goal_item_key>', example: 'call_outcome' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  internal_field: string;

  @ApiPropertyOptional({ description: 'CRM object / module the field belongs to', example: 'contacts' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  external_object?: string;

  @ApiProperty({ description: "The CRM's own field name", example: 'hs_lead_status' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  external_field: string;

  @ApiPropertyOptional({ enum: MappingDirection, default: MappingDirection.BOTH })
  @IsOptional()
  @IsEnum(MappingDirection)
  direction?: MappingDirection;

  @ApiPropertyOptional({ description: 'Pass this value to the agent before the call', default: false })
  @IsOptional()
  @IsBoolean()
  use_for_personalization?: boolean;

  @ApiPropertyOptional({
    description: 'Optional value transform: { format, map, default, prefix, suffix }',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  transform?: Record<string, any>;
}

export class PutFieldMappingsDto {
  @ApiPropertyOptional({ description: 'Save the mappings for this agent only; omit for connection-level mappings' })
  @IsOptional()
  @IsUUID()
  agent_uuid?: string;

  @ApiProperty({ type: [FieldMappingItemDto] })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => FieldMappingItemDto)
  mappings: FieldMappingItemDto[];
}
