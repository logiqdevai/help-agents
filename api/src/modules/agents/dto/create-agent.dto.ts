import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ example: 'Lead Follow-up Agent' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, example: 'Follows up with new leads.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ required: false, example: 'Find out whether the lead is still interested.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  purpose?: string;

  @ApiProperty({ required: false, description: 'Voice id chosen from GET /voices' })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiProperty({ required: false, example: 'en' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  language?: string;

  @ApiProperty({ required: false, description: 'What the agent says when the call is answered.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  first_message?: string;

  @ApiProperty({ required: false, description: 'Plain-language description of how the agent behaves.' })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  instructions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  goal?: string;

  @ApiProperty({ required: false, description: 'What counts as a successful call.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  success_criteria?: string;

  @ApiProperty({ required: false, description: 'What counts as an unsuccessful call.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  failure_criteria?: string;

  @ApiProperty({ required: false, minimum: 30, maximum: 7200 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(7200)
  max_call_duration_seconds?: number;

  @ApiProperty({ required: false, nullable: true, description: 'CRM connection used by this agent (null to detach).' })
  @IsOptional()
  @IsUUID()
  crm_integration_uuid?: string | null;

  @ApiProperty({ required: false, description: 'Which CRM details are handed to the agent before a call.' })
  @IsOptional()
  @IsObject()
  personalization_config?: Record<string, any> | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  detect_voicemail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  leave_voicemail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  voicemail_message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  transfer_enabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  transfer_on_request?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  transfer_on_unresolved?: boolean;

  @ApiProperty({ required: false, nullable: true, example: '+302101234567' })
  @IsOptional()
  @IsString()
  transfer_number?: string | null;

  @ApiProperty({ required: false, description: 'What the agent says when nobody can take the transferred call.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  transfer_fallback_message?: string;
}
