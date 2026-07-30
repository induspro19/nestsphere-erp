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
import { AmenityBookingService } from './amenity-booking.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Amenity Booking & Facility Reservation')
@ApiBearerAuth()
@Audit()
@Controller('amenity-booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmenityBookingController {
  constructor(private amenityService: AmenityBookingService) {}

  // ── Dashboard & Analytics ─────────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Amenity Booking Dashboard Metrics (Revenue, Pending, Confirmed)' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.amenityService.getMetrics(societyId);
  }

  // ── Amenity Management ────────────────────────

  @Get('amenities')
  @ApiOperation({ summary: 'List All Amenities (Club House, Gym, Pool, Courts, etc.)' })
  async getAmenities(
    @CurrentTenant() societyId: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    return this.amenityService.getAmenities(societyId, categoryCode);
  }

  @Post('amenities')
  @ApiOperation({ summary: 'Create Amenity (Capacity, Rates, Approval Rules, Time Slots)' })
  async createAmenity(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateAmenityDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.amenityService.createAmenity(societyId, dto, actorId);
  }

  @Get('amenities/:id')
  @ApiOperation({ summary: 'Get Amenity Detail, Rules, Booking History Count' })
  async getAmenity(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.amenityService.getAmenity(societyId, id);
  }

  // ── Calendar View ─────────────────────────────

  @Get('calendar')
  @ApiOperation({ summary: 'Monthly Calendar View (All Bookings Grouped by Date)' })
  async getCalendar(
    @CurrentTenant() societyId: string,
    @Query('month') month: string,
  ) {
    const m = month || new Date().toISOString().slice(0, 7);
    return this.amenityService.getCalendar(societyId, m);
  }

  // ── Booking CRUD ──────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Query Bookings (Date, Status, Amenity, Resident)' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryBookingsDto) {
    return this.amenityService.findAllBookings(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Single Booking Detail with QR Token & Payment Info' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.amenityService.findOneBooking(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Booking (AMB-00001, Conflict Detection, Waitlist Auto-Add)' })
  async createBooking(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateBookingDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.amenityService.createBooking(societyId, dto, actorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Approve / Reject / Cancel / Check-In / Check-Out Booking' })
  async updateBooking(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.amenityService.updateBooking(societyId, id, dto, actorId);
  }
}
