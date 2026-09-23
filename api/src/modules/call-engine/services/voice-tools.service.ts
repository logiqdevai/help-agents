import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ActionStatus, VoiceProvider } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CallActionsService } from './call-actions.service';
import { VoiceToolResponse } from '../interfaces/call-engine.interface';

const MAX_RESULT_CHARS = 4000;

/** Handles live tool invocations from the AI: it may only request; the platform decides (spec §44). */
@Injectable()
export class VoiceToolsService {
  private readonly logger = new Logger(VoiceToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly actions: CallActionsService,
  ) {}

  async handleToolCall(input: {
    external_call_id: string;
    name: string;
    args: unknown;
  }): Promise<VoiceToolResponse> {
    const call = await this.prisma.call.findFirst({
      where: { provider: VoiceProvider.RETELL, external_call_id: input.external_call_id },
    });
    if (!call) throw new NotFoundException('Call not found');

    const payload =
      input.args && typeof input.args === 'object' && !Array.isArray(input.args) ? (input.args as any) : {};

    try {
      const action = await this.actions.requestAction({
        company_uuid: call.company_uuid,
        call_uuid: call.id,
        source: 'AGENT',
        tool_key: input.name,
        payload,
        wait: true,
      });

      switch (action.status) {
        case ActionStatus.EXECUTED:
          return { success: true, result: this.trimResult(action.result) };
        case ActionStatus.REJECTED:
          return { success: false, error: action.rejection_reason ?? 'This action is not allowed' };
        default:
          return {
            success: false,
            error: 'The action could not be completed right now. A team member will follow up.',
          };
      }
    } catch (error) {
      this.logger.error(`Tool call "${input.name}" failed: ${error?.message}`);
      return { success: false, error: 'The action could not be completed right now.' };
    }
  }

  private trimResult(result: unknown): unknown {
    if (result === null || result === undefined) return {};
    const serialized = JSON.stringify(result);
    if (serialized.length <= MAX_RESULT_CHARS) return result;
    return { truncated: true, preview: serialized.slice(0, MAX_RESULT_CHARS) };
  }
}
