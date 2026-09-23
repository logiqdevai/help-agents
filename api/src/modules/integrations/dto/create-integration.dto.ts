import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IntegrationAuthType, IntegrationCategory, IntegrationProvider } from 'generated/prisma';

export class IntegrationCredentialsDto {
  @ApiPropertyOptional({ description: 'API key (auth type API_KEY)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  api_key?: string;

  @ApiPropertyOptional({ description: 'Header carrying the API key (default X-API-Key)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  header_name?: string;

  @ApiPropertyOptional({ description: 'Send the API key as this query parameter instead of a header' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  query_param?: string;

  @ApiPropertyOptional({ description: 'Bearer token (auth type BEARER_TOKEN)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  token?: string;

  @ApiPropertyOptional({ description: 'Username (auth type BASIC)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  username?: string;

  @ApiPropertyOptional({ description: 'Password (auth type BASIC)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  password?: string;

  @ApiPropertyOptional({ description: 'Custom headers (auth type CUSTOM_HEADERS)', type: 'object', additionalProperties: { type: 'string' } })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'OAuth2 client id (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  client_id?: string;

  @ApiPropertyOptional({ description: 'OAuth2 client secret (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  client_secret?: string;

  @ApiPropertyOptional({ description: 'OAuth2 token endpoint (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  token_url?: string;

  @ApiPropertyOptional({ description: 'OAuth2 scope (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  scope?: string;

  @ApiPropertyOptional({ description: 'Existing OAuth2 access token (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  access_token?: string;

  @ApiPropertyOptional({ description: 'Existing OAuth2 refresh token (custom OAuth2 connections)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  refresh_token?: string;
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Display name of the connection', example: 'Our in-house CRM' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: IntegrationProvider })
  @IsEnum(IntegrationProvider)
  provider: IntegrationProvider;

  @ApiPropertyOptional({ enum: IntegrationCategory, description: 'Defaults to the provider category' })
  @IsOptional()
  @IsEnum(IntegrationCategory)
  category?: IntegrationCategory;

  @ApiPropertyOptional({ description: 'Base URL of the system (custom / generic providers only)', example: 'https://crm.example.com/api' })
  @IsOptional()
  @IsUrl({ require_tld: true, require_protocol: true })
  @MaxLength(2000)
  base_url?: string;

  @ApiPropertyOptional({ description: 'Link to the system API documentation' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  api_docs_url?: string;

  @ApiPropertyOptional({ enum: IntegrationAuthType })
  @IsOptional()
  @IsEnum(IntegrationAuthType)
  auth_type?: IntegrationAuthType;

  @ApiPropertyOptional({ type: IntegrationCredentialsDto, description: 'Write-only. Stored encrypted, never returned.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationCredentialsDto)
  credentials?: IntegrationCredentialsDto;

  @ApiPropertyOptional({
    description:
      'Non-secret settings. Custom CRMs: endpoint definitions (test, lookup, update, note, task, fields). Others: portal_id / company_domain.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
