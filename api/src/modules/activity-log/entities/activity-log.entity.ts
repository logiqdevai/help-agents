import { ApiProperty } from '@nestjs/swagger';
import { ActorType } from 'generated/prisma';

class ActivityActor {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true, type: String }) name: string | null;
  @ApiProperty() email: string;
}

export class ActivityLogEntry {
  @ApiProperty() id: string;
  @ApiProperty({ type: ActivityActor, nullable: true }) actor: ActivityActor | null;
  @ApiProperty({ enum: ActorType }) actor_type: ActorType;
  @ApiProperty({ example: 'agent.created' }) action: string;
  @ApiProperty({ nullable: true, type: String }) entity_type: string | null;
  @ApiProperty({ nullable: true, type: String }) entity_uuid: string | null;
  @ApiProperty({ nullable: true, type: String, example: 'Call #18372' }) entity_label: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true }) metadata: object | null;
  @ApiProperty({ nullable: true, type: String }) ip_address: string | null;
  @ApiProperty() created_at: Date;
}
