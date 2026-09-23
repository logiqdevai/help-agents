import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TIME_RE } from '../utils/scheduling.utils';

export class ScheduleWhenDto {
  @ApiProperty({ enum: ['immediately', 'after_minutes', 'tomorrow', 'date'] })
  @IsIn(['immediately', 'after_minutes', 'tomorrow', 'date'])
  mode: 'immediately' | 'after_minutes' | 'tomorrow' | 'date';

  @ApiPropertyOptional({ description: 'Required for mode "after_minutes"', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(525600)
  minutes?: number;

  @ApiPropertyOptional({
    description: 'Required for mode "date": YYYY-MM-DD or ISO date-time, in the company timezone',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  date?: string;

  @ApiPropertyOptional({ description: 'HH:mm, used with a date-only `date`', example: '10:30' })
  @IsOptional()
  @Matches(TIME_RE, { message: 'time must be HH:mm' })
  time?: string;
}

export class ScheduleNewContactDto {
  @ApiPropertyOptional({ example: 'Maria Papadopoulou' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ description: 'Phone number, E.164 preferred', example: '+306912345678' })
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone: string;
}

export class CreateScheduledCallDto {
  @ApiProperty()
  @IsUUID()
  agent_uuid: string;

  @ApiPropertyOptional({ description: 'Existing contact. Provide this or `contact`.' })
  @IsOptional()
  @IsUUID()
  contact_uuid?: string;

  @ApiPropertyOptional({ type: ScheduleNewContactDto, description: 'Raw phone target. Provide this or `contact_uuid`.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleNewContactDto)
  contact?: ScheduleNewContactDto;

  @ApiProperty({ type: ScheduleWhenDto })
  @ValidateNested()
  @Type(() => ScheduleWhenDto)
  when: ScheduleWhenDto;
}
