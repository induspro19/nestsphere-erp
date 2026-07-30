import { Module } from '@nestjs/common';
import { MaintenanceBillingService } from './maintenance-billing.service';
import { MaintenanceBillingController } from './maintenance-billing.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MaintenanceBillingController],
  providers: [MaintenanceBillingService],
  exports: [MaintenanceBillingService],
})
export class MaintenanceBillingModule {}
