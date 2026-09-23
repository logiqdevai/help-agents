import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AutomationActionType, AutomationTrigger } from 'generated/prisma';

export class AutomationActionDto {
  @ApiProperty({ enum: AutomationActionType })
  @IsEnum(AutomationActionType)
  type: AutomationActionType;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Type-specific settings; strings may use {{call.summary}}, {{contact.name}}, {{gathered.<key>}}',
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Wait this many minutes after the trigger before running', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(43200)
  delay_minutes?: number;

  @ApiPropertyOptional({ description: 'Defaults to the array order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateAutomationRuleDto {
  @ApiProperty({ example: 'Interested -> follow up in 2 days' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: AutomationTrigger })
  @IsEnum(AutomationTrigger)
  trigger: AutomationTrigger;

  @ApiPropertyOptional({ nullable: true, description: 'null = applies to every agent of the company' })
  @IsOptional()
  @IsUUID()
  agent_uuid?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Only with trigger CALL_OUTCOME; requires agent_uuid' })
  @IsOptional()
  @IsUUID()
  outcome_uuid?: string | null;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'Optional filters: is_successful, direction, attempt_number_gte, outcome_key',
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any> | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Evaluation order among rules (lower first)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({ type: [AutomationActionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AutomationActionDto)
  actions: AutomationActionDto[];
}
