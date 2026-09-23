import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { VoiceProviderService } from '@/modules/voice-provider/voice-provider.service';
import { ProviderEventsService } from '../services/provider-events.service';
import { InboundCallService } from '../services/inbound-call.service';
import { VoiceWebhookEvent } from '../interfaces/calls.interface';

/** Public, signature-verified provider webhooks. Not part of the customer-facing API docs. */
@ApiExcludeController()
@Controller('webhooks/voice')
export class VoiceWebhooksController {
  private readonly logger = new Logger(VoiceWebhooksController.name);

  constructor(
    private readonly voice: VoiceProviderService,
    private readonly events: ProviderEventsService,
    private readonly inbound: InboundCallService,
  ) {}

  @Post('events')
  @HttpCode(200)
  async receiveEvent(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-retell-signature') signature: string | undefined,
    @Body() body: VoiceWebhookEvent,
  ) {
    await this.verify(req, signature);

    if (!body || typeof body.event !== 'string') throw new BadRequestException('Invalid event');

    const { duplicate } = await this.events.ingest(body);
    return { received: true, duplicate };
  }

  @Post('inbound')
  @HttpCode(200)
  async receiveInbound(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-retell-signature') signature: string | undefined,
    @Body() body: { call_inbound?: { from_number?: string; to_number?: string } },
  ) {
    await this.verify(req, signature);

    const info = body?.call_inbound ?? {};
    return this.inbound.buildInboundResponse(info.from_number, info.to_number);
  }

  private async verify(req: RawBodyRequest<Request>, signature: string | undefined): Promise<void> {
    if (!req.rawBody) throw new BadRequestException('Missing request body');

    const valid = await this.voice.verifyWebhook(req.rawBody.toString('utf8'), signature);
    if (!valid) {
      this.logger.warn('Rejected a voice webhook with an invalid signature');
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
