import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { VoiceProviderService } from './voice-provider.service';
import { VoicesQuerySchema, VoicesQueryType } from './dto/voices-query.schema';
import { Voice } from './entities/voice.entity';

@ApiTags('Voices')
@Controller('voices')
@CompanyAuth()
export class VoicesController {
  constructor(private readonly voiceProvider: VoiceProviderService) {}

  @Get()
  @RequirePermissions(Permissions.AGENTS_READ)
  @ApiOperation({ summary: 'List the voices an agent can use' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female'] })
  @ApiQuery({ name: 'accent', required: false })
  @ApiResponse({ status: 200, type: [Voice] })
  async list(@Query(new ZodValidationPipe(VoicesQuerySchema)) query: VoicesQueryType): Promise<Voice[]> {
    const voices = await this.voiceProvider.listVoices();
    const search = query.search?.toLowerCase();
    return voices.filter(
      (v) =>
        (!search || v.name.toLowerCase().includes(search)) &&
        (!query.gender || v.gender === query.gender) &&
        (!query.accent || v.accent?.toLowerCase() === query.accent.toLowerCase()),
    );
  }
}
