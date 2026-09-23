import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ImportPhoneNumberDto {
  @ApiProperty({ description: 'The number you already own', example: '+302101234567' })
  @IsString()
  @MinLength(5)
  number: string;

  @ApiProperty({
    required: false,
    description: 'Country used to interpret a number written without a "+" prefix',
    example: 'GR',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  default_country?: string;

  @ApiProperty({
    description: "Termination address of your carrier's SIP trunk",
    example: 'mytrunk.pstn.twilio.com',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  termination_uri: string;

  @ApiProperty({ required: false, description: 'SIP trunk username, if your carrier requires one' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sip_username?: string;

  @ApiProperty({ required: false, description: 'SIP trunk password, if your carrier requires one' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sip_password?: string;

  @ApiProperty({ required: false, description: 'Friendly label', example: 'Main office' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}
