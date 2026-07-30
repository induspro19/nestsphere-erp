import { Module } from '@nestjs/common';
import { AnalyticsEngineService } from './analytics-engine.service';
import { AnalyticsEngineController } from './analytics-engine.controller';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { ReportsService } from './reports.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceReportService } from './compliance-report.service';
import { ExportService } from './export.service';

@Module({
  controllers: [AnalyticsEngineController],
  providers: [
    AnalyticsEngineService,
    ExecutiveDashboardService,
    ReportsService,
    PredictiveAnalyticsService,
    BenchmarkService,
    ComplianceReportService,
    ExportService,
  ],
  exports: [
    AnalyticsEngineService,
    ExecutiveDashboardService,
    ReportsService,
    PredictiveAnalyticsService,
    BenchmarkService,
    ComplianceReportService,
    ExportService,
  ],
})
export class AnalyticsEngineModule {}
