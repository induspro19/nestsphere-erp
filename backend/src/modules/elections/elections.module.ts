import { Module } from '@nestjs/common';
import { ElectionsController } from './elections.controller';
import { ElectionsService } from './elections.service';
import { ElectionResultsService } from './election-results.service';
import { ElectionAnalyticsService } from './election-analytics.service';
import { ElectionCertificatesService } from './election-certificates.service';
import { CommitteeService } from './committee.service';

@Module({
  controllers: [ElectionsController],
  providers: [
    ElectionsService,
    ElectionResultsService,
    ElectionAnalyticsService,
    ElectionCertificatesService,
    CommitteeService,
  ],
  exports: [
    ElectionsService,
    ElectionResultsService,
    ElectionAnalyticsService,
    ElectionCertificatesService,
    CommitteeService,
  ],
})
export class ElectionsModule {}
