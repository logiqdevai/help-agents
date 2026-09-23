import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { VoiceToolsService } from '../services/voice-tools.service';

/** Public, signature-verified endpoint the voice provider calls when the AI invokes a tool. */
@ApiExcludeController()
@Controller('webhooks/voice')
export class VoiceToolsController {
  constructor(
    private readonly voice: VoiceProviderService,
    private readonly tools: VoiceToolsService,
  ) {}

  @Post('tools')
  @HttpCode(200)
  async handleTool(@Req() req: RawBodyRequest<Request>, @Body() body: any) {
    const rawBody = req.rawBody?.toString('utf8') ?? '';
    const signature = req.headers['x-retell-signature'];
    const verified = await this.voice.verifyWebhook(
      rawBody,
      Array.isArray(signature) ? signature[0] : signature,
    );
    if (!verified) throw new UnauthorizedException('Invalid signature');

    const callId = body?.call?.call_id;
    if (typeof body?.name !== 'string' || typeof callId !== 'string') {
      throw new BadRequestException('Invalid tool call payload');
    }

    return this.tools.handleToolCall({
      external_call_id: callId,
      name: body.name,
      args: body.args,
    });
  }
}
