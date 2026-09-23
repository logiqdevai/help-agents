import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class OAuthStartDto {
  @ApiPropertyOptional({ description: 'Name for the new connection (defaults to the provider name)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ description: 'Existing connection to reconnect instead of creating a new one' })
  @IsOptional()
  @IsUUID()
  integration_uuid?: string;
}
