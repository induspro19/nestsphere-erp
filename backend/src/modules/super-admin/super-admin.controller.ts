import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { 
  ProvisionSocietyDto, 
  UpdateFeatureFlagDto,
  UpdateSocietyDto,
  SocietyQueryDto,
  CreateLicenseDto,
  PlatformUserDto,
  CreateTicketDto,
  PlatformSettingsDto
} from './dto/super-admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('SUPER_ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // Dashboard
  @Get('dashboard')
  getMetrics() {
    return this.superAdminService.getDashboardMetrics();
  }

  @Get('analytics/platform')
  getPlatformAnalytics() {
    return this.superAdminService.getPlatformAnalytics();
  }

  // Societies
  @Get('societies')
  getSocieties(@Query() query: SocietyQueryDto) {
    return this.superAdminService.getSocieties(query);
  }

  @Get('societies/:id')
  getSocietyById(@Param('id') id: string) {
    return this.superAdminService.getSocietyById(id);
  }

  @Post('societies/provision')
  provisionTenant(@Body() dto: ProvisionSocietyDto) {
    return this.superAdminService.provisionTenant(dto);
  }

  @Put('societies/:id')
  updateSociety(@Param('id') id: string, @Body() dto: UpdateSocietyDto) {
    return this.superAdminService.updateSociety(id, dto);
  }

  @Patch('societies/:id/suspend')
  suspendSociety(@Param('id') id: string) {
    return this.superAdminService.suspendSociety(id);
  }

  @Patch('societies/:id/activate')
  activateSociety(@Param('id') id: string) {
    return this.superAdminService.activateSociety(id);
  }

  @Delete('societies/:id')
  archiveSociety(@Param('id') id: string) {
    return this.superAdminService.archiveSociety(id);
  }

  @Put('societies/:id/features')
  updateFeatureFlag(@Param('id') id: string, @Body() dto: UpdateFeatureFlagDto) {
    return this.superAdminService.updateFeatureFlag(id, dto);
  }

  // Subscriptions
  @Get('subscriptions/plans')
  getPlans() {
    return this.superAdminService.getPlans();
  }

  @Get('subscriptions/plans/:id')
  getPlanById(@Param('id') id: string) {
    return this.superAdminService.getPlanById(id);
  }

  // Licenses
  @Get('licenses')
  getLicenses() {
    return this.superAdminService.getLicenses();
  }

  @Post('licenses')
  generateLicense(@Body() dto: CreateLicenseDto) {
    return this.superAdminService.generateLicense(dto);
  }

  @Patch('licenses/:id/activate')
  activateLicense(@Param('id') id: string) {
    return this.superAdminService.activateLicense(id);
  }

  @Patch('licenses/:id/deactivate')
  deactivateLicense(@Param('id') id: string) {
    return this.superAdminService.deactivateLicense(id);
  }

  // Billing
  @Get('billing/dashboard')
  getBillingDashboard() {
    return this.superAdminService.getBillingDashboard();
  }

  @Get('billing/invoices')
  getInvoices() {
    return this.superAdminService.getInvoices();
  }

  // Platform Users
  @Get('users')
  getPlatformUsers() {
    return this.superAdminService.getPlatformUsers();
  }

  @Post('users')
  createPlatformUser(@Body() dto: PlatformUserDto) {
    return this.superAdminService.createPlatformUser(dto);
  }

  // Support
  @Get('support/tickets')
  getSupportTickets() {
    return this.superAdminService.getSupportTickets();
  }

  @Post('support/tickets')
  createTicket(@Body() dto: CreateTicketDto) {
    return this.superAdminService.createTicket(dto);
  }

  // Monitoring
  @Get('monitoring/health')
  getSystemHealth() {
    return this.superAdminService.getSystemHealth();
  }

  // Audit
  @Get('audit/logs')
  getAuditLogs(@Query() query: any) {
    return this.superAdminService.getAuditLogs(query);
  }

  // Settings
  @Get('settings')
  getSettings() {
    return this.superAdminService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() dto: PlatformSettingsDto) {
    return this.superAdminService.updateSettings(dto);
  }
}
