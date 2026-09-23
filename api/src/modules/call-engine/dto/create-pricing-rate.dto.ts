import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CostCategory, CostUnit, VoiceProvider } from 'generated/prisma';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min, MinLength } from 'class-validator';

export class CreatePricingRateDto {
  @ApiProperty({ description: 'Rate key, e.g. "ai.minute" or "telephony.minute"', example: 'ai.minute' })
  @IsString()
  @MinLength(1)
  key: string;

  @ApiProperty({ enum: CostCategory })
  @IsEnum(CostCategory)
  category: CostCategory;

  @ApiProperty({ enum: CostUnit })
  @IsEnum(CostUnit)
  unit: CostUnit;

  @ApiProperty({ description: 'Price per unit', example: 0.12 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  unit_price: number;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ enum: VoiceProvider })
  @IsOptional()
  @IsEnum(VoiceProvider)
  provider?: VoiceProvider;

  @ApiPropertyOptional({ description: 'Company-specific override; omit for the platform default' })
  @IsOptional()
  @IsUUID()
  company_uuid?: string;

  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effective_to?: string;
}
