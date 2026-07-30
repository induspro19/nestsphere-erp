import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Header,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsEngineService } from './analytics-engine.service';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { ReportsService } from './reports.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceReportService } from './compliance-report.service';
import { ExportService } from './export.service';
import { CreateReportConfigDto } from './dto/create-report-config.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise BI, Analytics & Decision Intelligence Platform')
@ApiBearerAuth()
@Audit()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsEngineController {
  constructor(
    private analyticsService: AnalyticsEngineService,
    private executiveService: ExecutiveDashboardService,
    private reportsService: ReportsService,
    private predictiveService: PredictiveAnalyticsService,
    private benchmarkService: BenchmarkService,
    private complianceService: ComplianceReportService,
    private exportService: ExportService,
  ) {}

  @Get('executive-kpis')
  @ApiOperation({ summary: 'Get Executive BI KPIs & Revenue Surplus Metrics' })
  async getExecutiveKPIs(@CurrentTenant() societyId: string) {
    return this.executiveService.getExecutiveKPIs(societyId);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get Financial Trial Balance Report' })
  async getTrialBalance(@CurrentTenant() societyId: string) {
    return this.reportsService.getTrialBalance(societyId);
  }

  @Get('defaulters-aging')
  @ApiOperation({ summary: 'Get Defaulter Ageing Analysis (0-30, 31-60, 61-90, 90+)' })
  async getDefaulterAging(@CurrentTenant() societyId: string) {
    return this.reportsService.getDefaulterAgingReport(societyId);
  }

  @Get('income-statement')
  @ApiOperation({ summary: 'Get Income & Expense Statement' })
  async getIncomeStatement(@CurrentTenant() societyId: string) {
    return this.reportsService.getIncomeStatement(societyId);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get Balance Sheet Statement (Assets vs Liabilities & Equity)' })
  async getBalanceSheet(@CurrentTenant() societyId: string) {
    return this.reportsService.getBalanceSheet(societyId);
  }

  @Get('bank-book')
  @ApiOperation({ summary: 'Get Bank Book Journal Transactions' })
  async getBankBook(@CurrentTenant() societyId: string) {
    return this.reportsService.getBankBook(societyId);
  }

  @Get('cash-book')
  @ApiOperation({ summary: 'Get Cash Book Journal Transactions' })
  async getCashBook(@CurrentTenant() societyId: string) {
    return this.reportsService.getCashBook(societyId);
  }

  @Get('budget-vs-actual')
  @ApiOperation({ summary: 'Get Budget vs Actual Expense Analysis' })
  async getBudgetVsActual(@CurrentTenant() societyId: string) {
    return this.reportsService.getBudgetVsActual(societyId);
  }

  @Get('resident-ledger')
  @ApiOperation({ summary: 'Get Resident Account Ledger Entries' })
  async getResidentLedger(@CurrentTenant() societyId: string, @Query('personId') personId?: string) {
    return this.reportsService.getResidentLedger(societyId, personId);
  }

  @Get('vendor-ledger')
  @ApiOperation({ summary: 'Get Vendor & AMC Contract Ledger' })
  async getVendorLedger(@CurrentTenant() societyId: string) {
    return this.reportsService.getVendorLedger(societyId);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Get AI Predictive Insights & Confidence Scores' })
  async getAiPredictiveInsights(@CurrentTenant() societyId: string) {
    return this.predictiveService.getAiPredictiveInsights(societyId);
  }

  @Get('benchmarks')
  @ApiOperation({ summary: 'Get Multi-Society Rankings & Benchmark Scores' })
  async getMultiSocietyBenchmarks() {
    return this.benchmarkService.getMultiSocietyBenchmarks();
  }

  @Get('compliance-audit')
  @ApiOperation({ summary: 'Get Society Audit & GST Compliance Helper Report' })
  async getComplianceAudit(@CurrentTenant() societyId: string) {
    return this.complianceService.getComplianceAudit(societyId);
  }

  @Get('export/defaulters-csv')
  @ApiOperation({ summary: 'Export Defaulter Report as CSV' })
  async exportDefaultersCsv(@CurrentTenant() societyId: string, @Res() res: Response) {
    const data = await this.reportsService.getDefaulterAgingReport(societyId);
    const csv = this.exportService.formatAsCsv(data.records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=defaulter-aging-report.csv');
    return res.send(csv);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Executive Multi-Module Dashboard Metrics' })
  async getExecutiveDashboard(@CurrentTenant() societyId: string, @Query() query: QueryAnalyticsDto) {
    return this.analyticsService.getExecutiveDashboard(societyId, query);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get Configured Saved Reports Suite' })
  async getReports(@CurrentTenant() societyId: string) {
    return this.analyticsService.getReports(societyId);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Create Saved Report Configuration' })
  async createReportConfig(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateReportConfigDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.analyticsService.createReportConfig(societyId, dto, actorId);
  }

  @Get('widgets')
  @ApiOperation({ summary: 'Get Custom Dashboard Widgets' })
  async getWidgets(@CurrentTenant() societyId: string) {
    return this.analyticsService.getWidgets(societyId);
  }

  @Post('widgets')
  @ApiOperation({ summary: 'Add Custom Dashboard Widget' })
  async createWidget(@CurrentTenant() societyId: string, @Body() dto: CreateWidgetDto) {
    return this.analyticsService.createWidget(societyId, dto);
  }
}
