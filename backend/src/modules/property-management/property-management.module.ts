import { Module } from '@nestjs/common';
import { PropertyManagementService } from './property-management.service';
import { PropertyManagementController } from './property-management.controller';

@Module({
  controllers: [PropertyManagementController],
  providers: [PropertyManagementService],
  exports: [PropertyManagementService],
})
export class PropertyManagementModule {}
