import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorAmcService } from './vendor-amc.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateAmcDto } from './dto/create-amc.dto';
import { CreateServiceVisitDto, UpdateServiceVisitDto } from './dto/create-service-visit.dto';
import { QueryVendorAmcDto } from './dto/query-vendor-amc.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { AmcContractStatus } from '@prisma/client';

@ApiTags('Enterprise Vendor & AMC Management')
@ApiBearerAuth()
@Audit()
@Controller('vendor-amc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorAmcController {
  constructor(private vendorAmcService: VendorAmcService) {}

  // ── Dashboard ─────────────────────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Vendor & AMC Dashboard: Active Vendors, AMC Status, Service Costs, Penalties' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.vendorAmcService.getMetrics(societyId);
  }

  // ── Vendor CRUD ────────────────────────────────

  @Get('vendors')
  @ApiOperation({ summary: 'List Vendors (Filter by Type, Status; includes AMC & visit counts)' })
  async getVendors(@CurrentTenant() societyId: string, @Query() query: QueryVendorAmcDto) {
    return this.vendorAmcService.getVendors(societyId, query);
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Create Vendor VEN-00001 (GST, PAN, Bank, QR, Rating, Preferred/Blacklist flags)' })
  async createVendor(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateVendorDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.createVendor(societyId, dto, actorId);
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'Vendor Detail with Contacts, AMC Contracts, Recent Service Visits' })
  async getVendor(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.vendorAmcService.getVendor(societyId, id);
  }

  @Put('vendors/:id')
  @ApiOperation({ summary: 'Update Vendor (Blacklist, Rating, Bank Details, Preferred Flag)' })
  async updateVendor(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVendorDto>,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.updateVendor(societyId, id, dto, actorId);
  }

  @Post('vendors/:id/contacts')
  @ApiOperation({ summary: 'Add Contact Person to Vendor (Multiple Contacts, Primary, Emergency)' })
  async addVendorContact(
    @CurrentTenant() societyId: string,
    @Param('id') vendorId: string,
    @Body() contact: { name: string; designation?: string; email?: string; phone: string; isPrimary?: boolean; isEmergency?: boolean },
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.addVendorContact(societyId, vendorId, contact, actorId);
  }

  // ── AMC Contracts ──────────────────────────────

  @Get('amc')
  @ApiOperation({ summary: 'List AMC Contracts (renewalDays=30 for upcoming renewals, filter by status, type)' })
  async getAmcContracts(@CurrentTenant() societyId: string, @Query() query: QueryVendorAmcDto) {
    return this.vendorAmcService.getAmcContracts(societyId, query);
  }

  @Post('amc')
  @ApiOperation({ summary: 'Create AMC Contract AMC-00001 (SLA, Linked Assets, Financial, Auto-Renewal)' })
  async createAmc(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateAmcDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.createAmc(societyId, dto, actorId);
  }

  @Put('amc/:id/status')
  @ApiOperation({ summary: 'Update AMC Status (ACTIVE, EXPIRED, TERMINATED, PENDING_RENEWAL, RENEWED)' })
  async updateAmcStatus(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('status') status: AmcContractStatus,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.updateAmcStatus(societyId, id, status, actorId);
  }

  // ── Service Visits ─────────────────────────────

  @Get('service-visits')
  @ApiOperation({ summary: 'List Service Visits (SV-00001, Filter by Type, Status, Vendor)' })
  async getServiceVisits(@CurrentTenant() societyId: string, @Query() query: QueryVendorAmcDto) {
    return this.vendorAmcService.getServiceVisits(societyId, query);
  }

  @Post('service-visits')
  @ApiOperation({ summary: 'Schedule Service Visit SV-00001 (Planned/Emergency/Breakdown/Inspection)' })
  async createServiceVisit(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateServiceVisitDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.createServiceVisit(societyId, dto, actorId);
  }

  @Put('service-visits/:id')
  @ApiOperation({ summary: 'Update Service Visit (Status, Costs, Rating, Checklist, Digital Signature)' })
  async updateServiceVisit(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServiceVisitDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.vendorAmcService.updateServiceVisit(societyId, id, dto, actorId);
  }
}
