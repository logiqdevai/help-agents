import { Module, OnModuleInit } from '@nestjs/common';
import { CallEngineModule } from '../call-engine/call-engine.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CallActionsService } from '../call-engine/services/call-actions.service';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { TwillioModule } from '@/integrations/notifications/twillio/twillio.module';
import { AutomationService } from './automation.service';
import { AutomationRulesService } from './services/automation-rules.service';
import { AutomationController } from './automation.controller';
import { EmailActionHandler } from './handlers/email-action.handler';
import { SmsActionHandler } from './handlers/sms-action.handler';
import { CalendarActionHandler } from './handlers/calendar-action.handler';
import { WebhookActionHandler } from './handlers/webhook-action.handler';

@Module({
  imports: [CallEngineModule, IntegrationsModule, ResendModule, TwillioModule],
  controllers: [AutomationController],
  providers: [
    AutomationService,
    AutomationRulesService,
    EmailActionHandler,
    SmsActionHandler,
    CalendarActionHandler,
    WebhookActionHandler,
  ],
  exports: [AutomationService],
})
export class AutomationModule implements OnModuleInit {
  constructor(
    private readonly callActions: CallActionsService,
    private readonly email: EmailActionHandler,
    private readonly sms: SmsActionHandler,
    private readonly calendar: CalendarActionHandler,
    private readonly webhook: WebhookActionHandler,
  ) {}

  onModuleInit() {
    [this.email, this.sms, this.calendar, this.webhook].forEach((handler) =>
      this.callActions.registerHandler(handler),
    );
  }
}
