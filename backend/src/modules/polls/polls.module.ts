import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { PollResultsService } from './poll-results.service';
import { PollAnalyticsService } from './poll-analytics.service';
import { PollExportService } from './poll-export.service';

@Module({
  controllers: [PollsController],
  providers: [
    PollsService,
    PollResultsService,
    PollAnalyticsService,
    PollExportService,
  ],
  exports: [
    PollsService,
    PollResultsService,
    PollAnalyticsService,
    PollExportService,
  ],
})
export class PollsModule {}
