import { ApiProperty } from '@nestjs/swagger';

export class CompanyDeletionStatusEntity {
  @ApiProperty() deletion_requested: boolean;
  @ApiProperty({ nullable: true, type: Date }) requested_at: Date | null;
  @ApiProperty({
    nullable: true,
    type: Date,
    description: 'All company data is permanently deleted at this time unless the request is cancelled',
  })
  scheduled_purge_at: Date | null;
  @ApiProperty({ example: 7 }) grace_period_days: number;
}
