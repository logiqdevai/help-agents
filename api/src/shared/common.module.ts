import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { CryptoService } from './utils/crypto/crypto.service';
import { ActivityLogService } from './services/activity-log/activity-log.service';
import { AlertsService } from './services/alerts/alerts.service';
import { AgentAccessService } from './services/agent-access/agent-access.service';
import { CompanyGuard } from './guards/company.guard';

/** Cross-cutting providers available to every module without importing. */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [CryptoService, ActivityLogService, AlertsService, AgentAccessService, CompanyGuard],
  exports: [
    PrismaModule,
    CryptoService,
    ActivityLogService,
    AlertsService,
    AgentAccessService,
    CompanyGuard,
  ],
})
export class CommonModule {}
