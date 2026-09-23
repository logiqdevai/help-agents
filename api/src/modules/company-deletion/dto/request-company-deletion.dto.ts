import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RequestCompanyDeletionDto {
  @ApiProperty({ description: 'Current password of the account owner making the request' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ description: 'Company name, typed exactly to confirm', example: 'Acme Ltd' })
  @IsString()
  @MinLength(1)
  company_name: string;
}
