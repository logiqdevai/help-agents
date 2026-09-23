import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class ProvisionPhoneNumberDto {
  @ApiProperty({ required: false, description: 'ISO country code of the number', example: 'US' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiProperty({ required: false, description: 'Preferred area code', example: '415' })
  @IsOptional()
  @Matches(/^\d{3}$/, { message: 'area_code must be 3 digits' })
  area_code?: string;

  @ApiProperty({ required: false, description: 'Friendly label', example: 'Sales line' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}
