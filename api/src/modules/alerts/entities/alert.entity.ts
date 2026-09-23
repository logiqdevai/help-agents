import { ApiProperty } from '@nestjs/swagger';
import { AlertSeverity, AlertStatus, AlertType } from 'generated/prisma';

export class AlertEntity {
  @ApiProperty() id: string;
  @ApiProperty({ enum: AlertType }) type: AlertType;
  @ApiProperty({ enum: AlertSeverity }) severity: AlertSeverity;
  @ApiProperty({ enum: AlertStatus }) status: AlertStatus;
  @ApiProperty({ example: 'CRM update failed' }) title: string;
  @ApiProperty({ nullable: true, type: String }) message: string | null;
  @ApiProperty({ nullable: true, type: String }) entity_type: string | null;
  @ApiProperty({ nullable: true, type: String }) entity_uuid: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true }) metadata: object | null;
  @ApiProperty({ nullable: true, type: Date }) resolved_at: Date | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class AlertsSummaryEntity {
  @ApiProperty() open_total: number;
  @ApiProperty({ type: 'array', items: { type: 'object' } }) by_type: Array<{ type: AlertType; count: number }>;
  @ApiProperty({ type: 'array', items: { type: 'object' } }) by_severity: Array<{
    severity: AlertSeverity;
    count: number;
  }>;
}
