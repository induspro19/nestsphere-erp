import { Module } from '@nestjs/common';
import { ParkingManagementService } from './parking-management.service';
import { ParkingManagementController } from './parking-management.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ParkingManagementController],
  providers: [ParkingManagementService],
  exports: [ParkingManagementService],
})
export class ParkingManagementModule {}
