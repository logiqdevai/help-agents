import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationAuthType, IntegrationCategory, IntegrationProvider, IntegrationStatus } from 'generated/prisma';

/** Response shape of a connection. Credentials are never included, only a masked hint. */
export class IntegrationEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: IntegrationCategory }) category: IntegrationCategory;
  @ApiProperty({ enum: IntegrationProvider }) provider: IntegrationProvider;
  @ApiProperty() provider_name: string;
  @ApiProperty({ enum: IntegrationStatus }) status: IntegrationStatus;
  @ApiPropertyOptional({ nullable: true }) base_url: string | null;
  @ApiPropertyOptional({ nullable: true }) api_docs_url: string | null;
  @ApiPropertyOptional({ enum: IntegrationAuthType, nullable: true }) auth_type: IntegrationAuthType | null;
  @ApiProperty() has_credentials: boolean;
  @ApiPropertyOptional({ nullable: true, example: '••••abcd' }) credentials_hint: string | null;
  @ApiPropertyOptional({ nullable: true }) token_expires_at: Date | null;
  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true }) config: Record<string, any> | null;
  @ApiPropertyOptional({ nullable: true }) last_error: string | null;
  @ApiPropertyOptional({ nullable: true }) last_verified_at: Date | null;
  @ApiProperty({ description: 'Agents that currently use this connection' }) agent_count: number;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class ProviderInfoEntity {
  @ApiProperty({ enum: IntegrationProvider }) provider: IntegrationProvider;
  @ApiProperty() display_name: string;
  @ApiProperty({ enum: IntegrationCategory }) category: IntegrationCategory;
  @ApiProperty({ enum: IntegrationAuthType, isArray: true }) auth_types: IntegrationAuthType[];
  @ApiProperty({ description: 'True when the one-click OAuth2 connect flow is available on this platform' }) oauth_available: boolean;
  @ApiProperty() requires_base_url: boolean;
  @ApiProperty({ description: 'True when contacts can be looked up and updated through this provider' }) supports_crm_actions: boolean;
  @ApiProperty({ description: 'True when the app cannot be connected yet (no CRM adapter and no OAuth flow available)' }) coming_soon: boolean;
}

export class IntegrationAgentToolEntity {
  @ApiProperty() id: string;
  @ApiProperty() key: string;
  @ApiProperty() name: string;
}

export class IntegrationAgentEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'INACTIVE'] }) status: string;
  @ApiProperty({ type: [IntegrationAgentToolEntity], description: 'CRM tools this agent is allowed to use on the connection' }) allowed_tools: IntegrationAgentToolEntity[];
}

export class CrmToolEntity {
  @ApiProperty() id: string;
  @ApiProperty() key: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
  @ApiPropertyOptional({ nullable: true }) category: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true }) input_schema: Record<string, any>;
  @ApiProperty({ enum: ['platform', 'custom'] }) scope: 'platform' | 'custom';
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, nullable: true, description: 'Custom tools only' }) http: Record<string, any> | null;
  @ApiProperty() is_active: boolean;
}

export class FieldMappingEntity {
  @ApiProperty() id: string;
  @ApiProperty() integration_uuid: string;
  @ApiPropertyOptional({ nullable: true }) agent_uuid: string | null;
  @ApiProperty() internal_field: string;
  @ApiPropertyOptional({ nullable: true }) external_object: string | null;
  @ApiProperty() external_field: string;
  @ApiProperty() direction: string;
  @ApiProperty() use_for_personalization: boolean;
  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true }) transform: Record<string, any> | null;
}
