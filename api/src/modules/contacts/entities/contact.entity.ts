import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CrmRecordType } from 'generated/prisma';

export class ContactIntegrationSummary {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() provider: string;
}

export class ContactEntity {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ nullable: true }) name: string | null;
  @ApiPropertyOptional({ nullable: true }) phone: string | null;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiPropertyOptional({ nullable: true }) integration_uuid: string | null;
  @ApiPropertyOptional({ nullable: true }) external_id: string | null;
  @ApiProperty({ enum: CrmRecordType }) record_type: CrmRecordType;
  @ApiPropertyOptional({ nullable: true }) external_url: string | null;
  @ApiProperty() do_not_call: boolean;
  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true }) data: Record<string, any> | null;
  @ApiPropertyOptional({ type: ContactIntegrationSummary, nullable: true }) integration?: ContactIntegrationSummary | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class ContactCallSummary {
  @ApiProperty() id: string;
  @ApiProperty() call_number: number;
  @ApiProperty() status: string;
  @ApiPropertyOptional({ nullable: true }) outcome_label: string | null;
  @ApiPropertyOptional({ nullable: true }) started_at: Date | null;
}
