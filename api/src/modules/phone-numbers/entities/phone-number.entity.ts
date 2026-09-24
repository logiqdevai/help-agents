import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberSource, PhoneNumberStatus } from 'generated/prisma';

export class PhoneNumberAgent {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class PhoneNumberSetupEntity {
  @ApiProperty({ nullable: true })
  inbound_sip_address: string | null;

  @ApiProperty({ nullable: true })
  termination_uri: string | null;
}

export class PhoneNumber {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: '+302101234567' })
  number: string;

  @ApiProperty({ nullable: true })
  label: string | null;

  @ApiProperty({ enum: PhoneNumberSource, description: 'PROVISIONED = obtained by the platform, BYO = your own number' })
  source: PhoneNumberSource;

  @ApiProperty({ enum: PhoneNumberStatus })
  status: PhoneNumberStatus;

  @ApiProperty({ nullable: true })
  last_error: string | null;

  @ApiProperty({ type: PhoneNumberAgent, nullable: true })
  agent: PhoneNumberAgent | null;

  @ApiProperty({ description: 'Calls made or received on this number' })
  call_count: number;

  @ApiProperty({ type: PhoneNumberSetupEntity, required: false, description: 'Carrier setup details (own numbers only)' })
  setup?: PhoneNumberSetupEntity;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
