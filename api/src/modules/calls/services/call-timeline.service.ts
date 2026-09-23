import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

/** Behind-the-scenes activity trail of a call (CallEvent). Never throws. */
@Injectable()
export class CallTimelineService {
  private readonly logger = new Logger(CallTimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async add(
    callUuid: string,
    type: string,
    message?: string | null,
    data?: Prisma.InputJsonValue,
  ): Promise<void> {
    try {
      await this.prisma.callEvent.create({
        data: { call_uuid: callUuid, type, message: message ?? null, data },
      });
    } catch (error) {
      this.logger.error(`Failed to write call event "${type}": ${error?.message}`);
    }
  }

  async has(callUuid: string, type: string): Promise<boolean> {
    const found = await this.prisma.callEvent.findFirst({
      where: { call_uuid: callUuid, type },
      select: { id: true },
    });
    return !!found;
  }
}
