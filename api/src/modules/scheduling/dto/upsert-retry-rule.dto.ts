import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RetryTrigger } from 'generated/prisma';
import { TIME_RE } from '../utils/scheduling.utils';

export class CallingHoursDayDto {
  @ApiPropertyOptional({ description: '0 = Sunday ... 6 = Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiPropertyOptional({ example: '09:00' })
  @Matches(TIME_RE)
  start_time: string;

  @ApiPropertyOptional({ example: '18:00' })
  @Matches(TIME_RE)
  end_time: string;

  @ApiPropertyOptional()
  @IsBoolean()
  is_enabled: boolean;
}

export class CallingHoursOverrideDto {
  @ApiPropertyOptional({ example: 'Europe/Athens' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ type: [CallingHoursDayDto] })
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => CallingHoursDayDto)
  days: CallingHoursDayDto[];
}

export class UpsertRetryRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  max_attempts?: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Minutes to wait before attempt n+2; the last value repeats',
    example: [120, 1440],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(525600, { each: true })
  delays_minutes?: number[];

  @ApiPropertyOptional({ enum: RetryTrigger, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RetryTrigger, { each: true })
  retry_on?: RetryTrigger[];

  @ApiPropertyOptional({
    type: CallingHoursOverrideDto,
    nullable: true,
    description: 'null = use the company calling hours',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CallingHoursOverrideDto)
  calling_hours_override?: CallingHoursOverrideDto | null;
}
