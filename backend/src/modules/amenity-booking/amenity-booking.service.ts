import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import {
  ActivityAction,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  PaymentMethod,
  TransactionType,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AmenityBookingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. AMENITY MANAGEMENT
  // ─────────────────────────────────────────────

  async createAmenity(societyId: string, dto: CreateAmenityDto, actorId: string) {
    const amenity = await this.prisma.amenity.create({
      data: {
        societyId,
        categoryCode: dto.categoryCode,
        name: dto.name,
        description: dto.description,
        location: dto.location,
        buildingId: dto.buildingId || null,
        capacity: dto.capacity || 10,
        hourlyRate: dto.hourlyRate || 0,
        dailyRate: dto.dailyRate || 0,
        securityDeposit: dto.securityDeposit || 0,
        cancellationFee: dto.cancellationFee || 0,
        openTime: dto.openTime || '06:00',
        closeTime: dto.closeTime || '22:00',
        requiresApproval: dto.requiresApproval ?? false,
        maxBookingHours: dto.maxBookingHours || 4,
        maxAdvanceBookDays: dto.maxAdvanceBookDays || 30,
        amenityRules: dto.amenityRules,
        qrToken: uuidv4(),
        createdBy: actorId,
      },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'AMENITY',
        entityId: amenity.id,
        action: ActivityAction.CREATED,
        title: `Amenity Created: ${amenity.name}`,
        description: amenity.categoryCode,
        actorId,
      },
    });

    return amenity;
  }

  async getAmenities(societyId: string, categoryCode?: string) {
    return this.prisma.amenity.findMany({
      where: {
        societyId,
        isDeleted: false,
        isActive: true,
        ...(categoryCode ? { categoryCode } : {}),
      },
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAmenity(societyId: string, id: string) {
    const amenity = await this.prisma.amenity.findFirst({
      where: { id, societyId, isDeleted: false },
      include: { _count: { select: { bookings: true } } },
    });
    if (!amenity) throw new NotFoundException('Amenity not found');
    return amenity;
  }

  // ─────────────────────────────────────────────
  // 2. CONFLICT DETECTION (slot availability)
  // ─────────────────────────────────────────────

  private async checkSlotConflict(
    amenityId: string,
    bookingDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const existingBookings = await this.prisma.amenityBooking.findMany({
      where: {
        amenityId,
        bookingDate,
        isDeleted: false,
        status: { in: ['APPROVED', 'PENDING_APPROVAL', 'CHECKED_IN'] },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
      select: { startTime: true, endTime: true },
    });

    const reqStart = this.timeToMinutes(startTime);
    const reqEnd = this.timeToMinutes(endTime);

    for (const existing of existingBookings) {
      const exStart = this.timeToMinutes(existing.startTime);
      const exEnd = this.timeToMinutes(existing.endTime);
      // Overlap: (reqStart < exEnd) AND (reqEnd > exStart)
      if (reqStart < exEnd && reqEnd > exStart) {
        return true; // conflict
      }
    }
    return false;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private calculateDurationHours(startTime: string, endTime: string): number {
    const diff = this.timeToMinutes(endTime) - this.timeToMinutes(startTime);
    return diff / 60;
  }

  // ─────────────────────────────────────────────
  // 3. CREATE BOOKING (AMB-00001 Auto Number)
  // ─────────────────────────────────────────────

  async createBooking(societyId: string, dto: CreateBookingDto, actorId: string) {
    const amenity = await this.getAmenity(societyId, dto.amenityId);
    const bookingDate = new Date(dto.bookingDate);

    // Advance booking limit check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAhead = Math.ceil(
      (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysAhead > amenity.maxAdvanceBookDays) {
      throw new BadRequestException(
        `Cannot book more than ${amenity.maxAdvanceBookDays} days in advance`,
      );
    }

    // Duration check
    const durationHours = this.calculateDurationHours(dto.startTime, dto.endTime);
    if (durationHours < amenity.minBookingHours) {
      throw new BadRequestException(
        `Minimum booking duration is ${amenity.minBookingHours} hour(s)`,
      );
    }
    if (durationHours > amenity.maxBookingHours) {
      throw new BadRequestException(
        `Maximum booking duration is ${amenity.maxBookingHours} hour(s)`,
      );
    }

    // Member limit check
    const existingMemberBookings = await this.prisma.amenityBooking.count({
      where: {
        amenityId: dto.amenityId,
        personId: dto.personId,
        isDeleted: false,
        status: { in: ['PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN'] },
      },
    });
    if (existingMemberBookings >= amenity.maxBookingsPerMember) {
      throw new BadRequestException(
        `Member already has ${existingMemberBookings} active booking(s). Max allowed: ${amenity.maxBookingsPerMember}`,
      );
    }

    // Conflict detection
    const hasConflict = await this.checkSlotConflict(
      dto.amenityId,
      bookingDate,
      dto.startTime,
      dto.endTime,
    );

    if (hasConflict && !amenity.requiresApproval) {
      // Add to waitlist
      const waitlistCount = await this.prisma.amenityWaitlist.count({
        where: { amenityId: dto.amenityId, bookingDate },
      });

      const expiresAt = new Date(bookingDate);
      expiresAt.setHours(23, 59, 59);

      await this.prisma.amenityWaitlist.create({
        data: {
          amenityId: dto.amenityId,
          personId: dto.personId,
          bookingDate,
          startTime: dto.startTime,
          endTime: dto.endTime,
          position: waitlistCount + 1,
          expiresAt,
        },
      });

      return {
        waitlisted: true,
        position: waitlistCount + 1,
        message: 'Slot not available. Added to waitlist.',
      };
    }

    // Auto-generate booking number
    const count = await this.prisma.amenityBooking.count({ where: { societyId } });
    const bookingNumber = `AMB-${String(count + 1).padStart(5, '0')}`;

    // Calculate charges
    const bookingCharge = durationHours * Number(amenity.hourlyRate);
    const securityDeposit = Number(amenity.securityDeposit);
    const totalAmount = bookingCharge + securityDeposit;

    // Determine initial status
    const status = amenity.requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED';

    const booking = await this.prisma.amenityBooking.create({
      data: {
        societyId,
        amenityId: dto.amenityId,
        personId: dto.personId,
        bookingNumber,
        bookingType: dto.bookingType || 'HOURLY',
        status: status as any,
        bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        durationHours,
        guestCount: dto.guestCount || 1,
        purposeNotes: dto.purposeNotes,
        bookingCharge,
        securityDeposit,
        totalAmount,
        paymentMethod: dto.paymentMethod || PaymentMethod.RAZORPAY,
        gatewayRef: dto.gatewayRef,
        qrToken: uuidv4(),
        createdBy: actorId,
      },
      include: { amenity: true, person: true },
    });

    // Mirror in Financial Engine
    if (totalAmount > 0) {
      const txnCount = await this.prisma.financialTransaction.count({ where: { societyId } });
      await this.prisma.financialTransaction.create({
        data: {
          societyId,
          txnNumber: `AMB-TXN-${String(txnCount + 1).padStart(5, '0')}`,
          txnType: TransactionType.INVOICE,
          txnDate: new Date(),
          personId: dto.personId,
          subtotal: bookingCharge,
          totalAmount,
          outstandingAmount: totalAmount,
          paymentMethod: dto.paymentMethod || PaymentMethod.RAZORPAY,
          status: 'UNPAID',
          createdBy: actorId,
        },
      });
    }

    // Notify resident
    await this.notificationsService.send(societyId, {
      recipientType: 'USER',
      recipientId: dto.personId,
      title: amenity.requiresApproval
        ? `Booking Submitted: ${bookingNumber}`
        : `Booking Confirmed: ${bookingNumber}`,
      message: amenity.requiresApproval
        ? `Your booking for ${amenity.name} on ${dto.bookingDate} (${dto.startTime}–${dto.endTime}) is pending approval.`
        : `Your booking for ${amenity.name} on ${dto.bookingDate} (${dto.startTime}–${dto.endTime}) is confirmed!`,
      channel: NotificationChannel.IN_APP,
      category: NotificationCategory.BOOKING,
      priority: NotificationPriority.HIGH,
    });

    // Activity log
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'AMENITY_BOOKING',
        entityId: booking.id,
        action: ActivityAction.CREATED,
        title: `Booking Created: ${bookingNumber}`,
        description: `${amenity.name} | ${dto.bookingDate} ${dto.startTime}–${dto.endTime}`,
        actorId,
      },
    });

    return booking;
  }

  // ─────────────────────────────────────────────
  // 4. QUERY BOOKINGS
  // ─────────────────────────────────────────────

  async findAllBookings(societyId: string, query: QueryBookingsDto) {
    const { search, amenityId, status, bookingDate, month, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;
    const where: any = { societyId, isDeleted: false };

    if (amenityId) where.amenityId = amenityId;
    if (status) where.status = status;

    if (bookingDate) {
      where.bookingDate = new Date(bookingDate);
    } else if (month) {
      const [year, mon] = month.split('-').map(Number);
      where.bookingDate = {
        gte: new Date(year, mon - 1, 1),
        lt: new Date(year, mon, 1),
      };
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { amenity: { name: { contains: search, mode: 'insensitive' } } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
        { person: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.amenityBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ bookingDate: 'desc' }, { startTime: 'asc' }],
        include: {
          amenity: { select: { name: true, categoryCode: true, location: true } },
          person: { select: { firstName: true, lastName: true, phone: true } },
        },
      }),
      this.prisma.amenityBooking.count({ where }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneBooking(societyId: string, id: string) {
    const booking = await this.prisma.amenityBooking.findFirst({
      where: { id, societyId, isDeleted: false },
      include: { amenity: true, person: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  // ─────────────────────────────────────────────
  // 5. APPROVE / REJECT / CANCEL / CHECK-IN / CHECK-OUT
  // ─────────────────────────────────────────────

  async updateBooking(societyId: string, id: string, dto: UpdateBookingDto, actorId: string) {
    const booking = await this.findOneBooking(societyId, id);
    const now = new Date();

    const updateData: any = {};

    if (dto.status) {
      updateData.status = dto.status;

      if (dto.status === 'APPROVED') {
        updateData.approvedBy = actorId;
        updateData.approvedAt = now;

        // Notify resident of approval
        await this.notificationsService.send(societyId, {
          recipientType: 'USER',
          recipientId: booking.personId,
          title: `Booking Approved: ${booking.bookingNumber}`,
          message: `Your ${(booking.amenity as any)?.name || 'amenity'} booking is approved. QR pass ready.`,
          channel: NotificationChannel.IN_APP,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.HIGH,
        });
      }

      if (dto.status === 'REJECTED') {
        updateData.rejectionReason = dto.rejectionReason;
        await this.notificationsService.send(societyId, {
          recipientType: 'USER',
          recipientId: booking.personId,
          title: `Booking Rejected: ${booking.bookingNumber}`,
          message: dto.rejectionReason || 'Your booking was rejected.',
          channel: NotificationChannel.IN_APP,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.MEDIUM,
        });
      }

      if (dto.status === 'CANCELLED') {
        updateData.cancelledBy = actorId;
        updateData.cancelledAt = now;
        updateData.cancellationNote = dto.cancellationNote;

        // Calculate refund: refund bookingCharge if cancelled, forfeit security deposit
        const cancellationFee = Number(booking.cancellationFee);
        const refundAmount = Math.max(0, Number(booking.bookingCharge) - cancellationFee);
        updateData.refundAmount = refundAmount;
        updateData.status = 'CANCELLED';
      }

      if (dto.status === 'CHECKED_IN') {
        updateData.checkedInAt = now;
        updateData.checkedInBy = actorId;
      }

      if (dto.status === 'CHECKED_OUT') {
        updateData.checkedOutAt = now;
        if (dto.damageCharges && dto.damageCharges > 0) {
          updateData.damageCharges = dto.damageCharges;
          updateData.totalAmount = Number(booking.totalAmount) + dto.damageCharges;
        }
        updateData.status = 'COMPLETED';
      }
    }

    const updated = await this.prisma.amenityBooking.update({
      where: { id },
      data: updateData,
      include: { amenity: true, person: true },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'AMENITY_BOOKING',
        entityId: id,
        action: ActivityAction.UPDATED,
        title: `Booking ${dto.status}: ${booking.bookingNumber}`,
        description: dto.cancellationNote || dto.rejectionReason || '',
        actorId,
      },
    });

    return updated;
  }

  // ─────────────────────────────────────────────
  // 6. CALENDAR: get all bookings for a date range
  // ─────────────────────────────────────────────

  async getCalendar(societyId: string, month: string) {
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);

    const bookings = await this.prisma.amenityBooking.findMany({
      where: {
        societyId,
        isDeleted: false,
        bookingDate: { gte: start, lt: end },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      include: {
        amenity: { select: { name: true, categoryCode: true } },
        person: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }],
    });

    // Group by date
    const calendar: Record<string, typeof bookings> = {};
    bookings.forEach((b) => {
      const key = new Date(b.bookingDate).toISOString().split('T')[0];
      if (!calendar[key]) calendar[key] = [];
      calendar[key].push(b);
    });

    return { month, calendar };
  }

  // ─────────────────────────────────────────────
  // 7. DASHBOARD METRICS
  // ─────────────────────────────────────────────

  async getMetrics(societyId: string) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = currentMonth.split('-').map(Number);
    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon, 1);

    const [totalAmenities, allBookings, monthBookings] = await Promise.all([
      this.prisma.amenity.count({ where: { societyId, isDeleted: false } }),
      this.prisma.amenityBooking.findMany({
        where: { societyId, isDeleted: false },
        select: { status: true, totalAmount: true, paidAmount: true },
      }),
      this.prisma.amenityBooking.count({
        where: {
          societyId,
          isDeleted: false,
          bookingDate: { gte: monthStart, lt: monthEnd },
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
      }),
    ]);

    let totalBookings = allBookings.length;
    let pendingApproval = 0;
    let confirmedBookings = 0;
    let totalRevenue = 0;

    allBookings.forEach((b) => {
      if (b.status === 'PENDING_APPROVAL') pendingApproval++;
      if (b.status === 'APPROVED' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED') confirmedBookings++;
      totalRevenue += Number(b.paidAmount);
    });

    return {
      totalAmenities,
      totalBookings,
      pendingApproval,
      confirmedBookings,
      thisMonthBookings: monthBookings,
      totalRevenue,
    };
  }
}
