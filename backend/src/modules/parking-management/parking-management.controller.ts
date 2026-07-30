import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingManagementService } from './parking-management.service';
import { CreateParkingZoneDto } from './dto/create-parking-zone.dto';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { QueryParkingDto } from './dto/query-parking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Parking & Vehicle Management')
@ApiBearerAuth()
@Audit()
@Controller('parking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParkingManagementController {
  constructor(private parkingService: ParkingManagementService) {}

  // ── Dashboard ─────────────────────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Parking Dashboard: Available, Occupied, EV Slots, Revenue, Expiry Alerts' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.parkingService.getMetrics(societyId);
  }

  @Get('expiry-alerts')
  @ApiOperation({ summary: 'Vehicle Compliance Expiry Alerts: Insurance, PUC, Fitness (30-day window)' })
  async getExpiryAlerts(@CurrentTenant() societyId: string) {
    return this.parkingService.getExpiryAlerts(societyId);
  }

  // ── Parking Zones ─────────────────────────────

  @Get('zones')
  @ApiOperation({ summary: 'List All Parking Zones (Basement, Covered, Open, EV, Visitor, etc.)' })
  async getZones(@CurrentTenant() societyId: string) {
    return this.parkingService.getZones(societyId);
  }

  @Post('zones')
  @ApiOperation({ summary: 'Create Parking Zone (Type, Floor, Capacity)' })
  async createZone(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateParkingZoneDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.createZone(societyId, dto, actorId);
  }

  // ── Parking Slots ─────────────────────────────

  @Get('slots')
  @ApiOperation({ summary: 'List Parking Slots (Filter by Zone, Status, Size, EV/RFID)' })
  async getSlots(@CurrentTenant() societyId: string, @Query() query: QueryParkingDto) {
    return this.parkingService.getSlots(societyId, query);
  }

  @Post('slots')
  @ApiOperation({ summary: 'Create Individual Parking Slot (EV/RFID/Boom Barrier flags)' })
  async createSlot(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateParkingSlotDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.createSlot(societyId, dto, actorId);
  }

  @Put('slots/:id/status')
  @ApiOperation({ summary: 'Update Slot Status (AVAILABLE, BLOCKED, MAINTENANCE, RESERVED)' })
  async updateSlotStatus(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.updateSlotStatus(societyId, id, status, actorId);
  }

  // ── Vehicle Register ───────────────────────────

  @Get('vehicles')
  @ApiOperation({ summary: 'Vehicle Register (Search by Vehicle No., RFID, Owner, Unit)' })
  async getVehicles(@CurrentTenant() societyId: string, @Query() query: QueryParkingDto) {
    return this.parkingService.getVehicles(societyId, query);
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Get Vehicle Detail (Compliance Dates, RFID, FASTag, Allocation)' })
  async getVehicle(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.parkingService.getVehicle(societyId, id);
  }

  @Post('vehicles')
  @ApiOperation({ summary: 'Register Vehicle (Unlimited per Unit, RFID, FASTag, Insurance/PUC/RC)' })
  async registerVehicle(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateVehicleDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.registerVehicle(societyId, dto, actorId);
  }

  // ── Parking Allocations ────────────────────────

  @Get('allocations')
  @ApiOperation({ summary: 'List Parking Allocations (Filter by Type: PERMANENT/GUEST/TEMPORARY)' })
  async getAllocations(@CurrentTenant() societyId: string, @Query() query: QueryParkingDto) {
    return this.parkingService.getAllocations(societyId, query);
  }

  @Post('allocations')
  @ApiOperation({ summary: 'Create Allocation PA-00001 (Conflict Check, Slot Auto-Mark OCCUPIED)' })
  async createAllocation(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateAllocationDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.createAllocation(societyId, dto, actorId);
  }

  @Delete('allocations/:id')
  @ApiOperation({ summary: 'Deactivate Allocation (Slot Released to AVAILABLE)' })
  async deactivateAllocation(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.deactivateAllocation(societyId, id, actorId);
  }

  @Put('allocations/:id/transfer')
  @ApiOperation({ summary: 'Transfer Parking Slot to Another Resident (Swap Support)' })
  async transferAllocation(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('newPersonId') newPersonId: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.parkingService.transferAllocation(societyId, id, newPersonId, actorId);
  }
}
