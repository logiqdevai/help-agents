import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/internal/mail/mail.module';
import { SmsModule } from './modules/internal/sms/sms.module';
import { AiModule } from './modules/internal/ai/ai.module';
import { RedisModule } from './core/databases/redis/redis.module';
import { RedisCacheModule } from './modules/internal/redis-cache/redis-cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from './shared/config/env/env.module';
import { CommonModule } from './shared/common.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { VoiceProviderModule } from './modules/voice-provider/voice-provider.module';
import { PhoneNumbersModule } from './modules/phone-numbers/phone-numbers.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AgentsModule } from './modules/agents/agents.module';
import { CallEngineModule } from './modules/call-engine/call-engine.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { AutomationModule } from './modules/automation/automation.module';
import { CallsModule } from './modules/calls/calls.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { CompanyDeletionModule } from './modules/company-deletion/company-deletion.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    CommonModule,
    MailModule,
    SmsModule,
    AiModule,
    RedisModule,
    RedisCacheModule,
    // GraphQLModule,
    AuthModule,
    HealthModule,
    CompaniesModule,
    VoiceProviderModule,
    PhoneNumbersModule,
    KnowledgeModule,
    IntegrationsModule,
    ContactsModule,
    AgentsModule,
    CallEngineModule,
    SchedulingModule,
    AutomationModule,
    CallsModule,
    DashboardModule,
    ActivityLogModule,
    AlertsModule,
    CompanyDeletionModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
