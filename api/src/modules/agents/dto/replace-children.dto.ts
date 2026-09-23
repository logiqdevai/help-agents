import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GoalDataType, GoalRequirement, OutcomeSystemType } from 'generated/prisma';

const KEY_REGEX = /^[a-z][a-z0-9_]{0,63}$/;

export class GoalItemInputDto {
  @ApiProperty({ required: false, description: 'Existing item id; omit to create.' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false, description: 'snake_case key; generated from the label when omitted.' })
  @IsOptional()
  @Matches(KEY_REGEX, { message: 'key must be snake_case (a-z, 0-9, _)' })
  key?: string;

  @ApiProperty({ example: 'Are they interested?' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, enum: GoalRequirement })
  @IsOptional()
  @IsEnum(GoalRequirement)
  requirement?: GoalRequirement;

  @ApiProperty({ required: false, enum: GoalDataType })
  @IsOptional()
  @IsEnum(GoalDataType)
  data_type?: GoalDataType;

  @ApiProperty({ required: false, type: [String], description: 'Required and non-empty when data_type is ENUM.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  enum_values?: string[];
}

export class ReplaceGoalItemsDto {
  @ApiProperty({ type: [GoalItemInputDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => GoalItemInputDto)
  items: GoalItemInputDto[];
}

export class QuestionInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Are you still interested?' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  question: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({ required: false, example: 'Yes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  expected_answer?: string;
}

export class ReplaceQuestionsDto {
  @ApiProperty({ type: [QuestionInputDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuestionInputDto)
  items: QuestionInputDto[];
}

export class OutcomeInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false, description: 'snake_case key; generated from the label when omitted.' })
  @IsOptional()
  @Matches(KEY_REGEX, { message: 'key must be snake_case (a-z, 0-9, _)' })
  key?: string;

  @ApiProperty({ example: 'Interested' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_success?: boolean;

  @ApiProperty({ required: false, enum: OutcomeSystemType, description: 'Marks automatically detected outcomes.' })
  @IsOptional()
  @IsEnum(OutcomeSystemType)
  system_type?: OutcomeSystemType;
}

export class ReplaceOutcomesDto {
  @ApiProperty({ type: [OutcomeInputDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OutcomeInputDto)
  items: OutcomeInputDto[];
}

export class ReplaceTransferOutcomesDto {
  @ApiProperty({ type: [String], description: 'Outcome ids that trigger a transfer to a human.' })
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  outcome_uuids: string[];
}

export class ReplaceCrmToolsDto {
  @ApiProperty({ type: [String], description: 'CRM tools this agent is allowed to use.' })
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  crm_tool_uuids: string[];
}

export class ReplaceKnowledgeSourcesDto {
  @ApiProperty({ type: [String], description: 'Knowledge sources this agent can use.' })
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('all', { each: true })
  source_uuids: string[];
}
