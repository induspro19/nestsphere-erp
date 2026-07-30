import { Module } from '@nestjs/common';
import { PeopleManagementService } from './people-management.service';
import { PeopleManagementController } from './people-management.controller';

@Module({
  controllers: [PeopleManagementController],
  providers: [PeopleManagementService],
  exports: [PeopleManagementService],
})
export class PeopleManagementModule {}
