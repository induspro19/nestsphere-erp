import { Module } from '@nestjs/common';
import { AmenityBookingService } from './amenity-booking.service';
import { AmenityBookingController } from './amenity-booking.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AmenityBookingController],
  providers: [AmenityBookingService],
  exports: [AmenityBookingService],
})
export class AmenityBookingModule {}
