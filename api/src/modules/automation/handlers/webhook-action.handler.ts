import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ActionKind, Call, CallAction, Prisma } from 'generated/prisma';
import { CallActionHandler } from '@/modules/call-engine/interfaces/call-engine.interface';
import { assertPublicUrl } from '../utils/ssrf.utils';
import { asJson, describeError, payloadOf } from './handler.utils';

@Injectable()
export class WebhookActionHandler implements CallActionHandler {
  readonly kind = ActionKind.OTHER;

  async execute(action: CallAction, _call: Call): Promise<Prisma.InputJsonValue> {
    const p = payloadOf(action);
    if (!p.url) throw new Error('Webhook URL is missing');

    const url = await assertPublicUrl(String(p.url));

    try {
      const response = await axios.post(url.toString(), p.body ?? {}, {
        headers: { 'Content-Type': 'application/json', ...(p.headers ?? {}) },
        timeout: 10_000,
        maxRedirects: 0,
        maxContentLength: 1024 * 1024,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      return asJson({ status: response.status });
    } catch (error) {
      throw new Error(`Webhook call failed: ${describeError(error)}`);
    }
  }
}
