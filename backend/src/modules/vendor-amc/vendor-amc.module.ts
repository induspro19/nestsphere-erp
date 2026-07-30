import { Module } from '@nestjs/common';
import { VendorAmcService } from './vendor-amc.service';
import { VendorAmcController } from './vendor-amc.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [VendorAmcController],
  providers: [VendorAmcService],
  exports: [VendorAmcService],
})
export class VendorAmcModule {}
