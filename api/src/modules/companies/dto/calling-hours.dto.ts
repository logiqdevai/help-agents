import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, Matches, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CallingHourDto {
  @ApiProperty({ description: '0 = Sunday ... 6 = Saturday', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({ example: '09:00' })
  @Matches(TIME_RE, { message: 'start_time must be HH:mm' })
  start_time: string;

  @ApiProperty({ example: '18:00' })
  @Matches(TIME_RE, { message: 'end_time must be HH:mm' })
  end_time: string;

  @ApiProperty({ description: 'false = no calling that day' })
  @IsBoolean()
  is_enabled: boolean;
}

export class SetCallingHoursDto {
  @ApiProperty({ type: [CallingHourDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => CallingHourDto)
  days: CallingHourDto[];
}
