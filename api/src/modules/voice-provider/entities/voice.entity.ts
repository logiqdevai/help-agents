import { ApiProperty } from '@nestjs/swagger';

export class Voice {
  @ApiProperty({ example: 'voice_abc' })
  voice_id: string;

  @ApiProperty({ example: 'Sophia' })
  name: string;

  @ApiProperty({ required: false, nullable: true, example: 'female' })
  gender?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'American' })
  accent?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'en' })
  language?: string | null;

  @ApiProperty({ required: false, nullable: true })
  preview_audio_url?: string | null;
}
