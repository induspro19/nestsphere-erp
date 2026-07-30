import { Module } from '@nestjs/common';
import { VisitorManagementService } from './visitor-management.service';
import { VisitorManagementController } from './visitor-management.controller';
import { AccessControlModule } from '../access-control/access-control.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowEngineModule } from '../workflow-engine/workflow-engine.module';

@Module({
  imports: [AccessControlModule, NotificationsModule, WorkflowEngineModule],
  controllers: [VisitorManagementController],
  providers: [VisitorManagementService],
  exports: [VisitorManagementService],
})
export class VisitorManagementModule {}
