import { Module } from '@nestjs/common';
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module';
import { VoiceProviderModule } from '../voice-provider/voice-provider.module';
import { CompanyDeletionController } from './company-deletion.controller';
import { CompanyDeletionService } from './company-deletion.service';
import { CompanyPurgeService } from './company-purge.service';

@Module({
  imports: [VoiceProviderModule, GcsIntegrationModule],
  controllers: [CompanyDeletionController],
  providers: [CompanyDeletionService, CompanyPurgeService],
  exports: [CompanyPurgeService],
})
export class CompanyDeletionModule {}
