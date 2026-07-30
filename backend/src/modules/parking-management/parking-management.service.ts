import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateParkingZoneDto } from './dto/create-parking-zone.dto';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { QueryParkingDto } from './dto/query-parking.dto';
import {
  ActivityAction,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ParkingManagementService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. PARKING ZONE MANAGEMENT
  // ─────────────────────────────────────────────

  async createZone(societyId: string, dto: CreateParkingZoneDto, actorId: string) {
    const zone = await this.prisma.parkingZone.create({
      data: {
        societyId,
        code: dto.code.toUpperCase(),
        name: dto.name,
        parkingType: dto.parkingType,
        buildingId: dto.buildingId || null,
        floor: dto.floor,
        totalSlots: dto.totalSlots || 0,
        description: dto.description,
        createdBy: actorId,
      },
    });

    await this.logActivity(societyId, 'PARKING_ZONE', zone.id, ActivityAction.CREATED, `Zone Created: ${zone.name}`, '', actorId);
    return zone;
  }

  async getZones(societyId: string) {
    return this.prisma.parkingZone.findMany({
      where: { societyId, isDeleted: false },
      include: {
        _count: { select: { slots: true } },
        slots: {
          where: { isDeleted: false },
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ─────────────────────────────────────────────
  // 2. PARKING SLOT MANAGEMENT
  // ─────────────────────────────────────────────

  async createSlot(societyId: string, dto: CreateParkingSlotDto, actorId: string) {
    // Verify zone belongs to society
    const zone = await this.prisma.parkingZone.findFirst({
      where: { id: dto.zoneId, societyId, isDeleted: false },
    });
    if (!zone) throw new NotFoundException('Parking zone not found');

    // Duplicate slot number check
    const existing = await this.prisma.parkingSlot.findFirst({
      where: { zoneId: dto.zoneId, slotNumber: dto.slotNumber, isDeleted: false },
    });
    if (existing) throw new ConflictException(`Slot ${dto.slotNumber} already exists in this zone`);

    const slot = await this.prisma.parkingSlot.create({
      data: {
        societyId,
        zoneId: dto.zoneId,
        slotNumber: dto.slotNumber,
        slotSize: dto.slotSize || 'CAR',
        floor: dto.floor,
        block: dto.block,
        location: dto.location,
        isEvEnabled: dto.isEvEnabled ?? false,
        isRfidEnabled: dto.isRfidEnabled ?? false,
        isQrEnabled: dto.isQrEnabled ?? true,
        isBoomBarrier: dto.isBoomBarrier ?? false,
        isDisabled: dto.isDisabled ?? false,
        monthlyRate: dto.monthlyRate || 0,
        qrToken: uuidv4(),
        createdBy: actorId,
      },
    });

    // Update zone total slot count
    await this.prisma.parkingZone.update({
      where: { id: dto.zoneId },
      data: { totalSlots: { increment: 1 } },
    });

    return slot;
  }

  async getSlots(societyId: string, query: QueryParkingDto) {
    const { zoneId, slotStatus, slotSize, page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (zoneId) where.zoneId = zoneId;
    if (slotStatus) where.status = slotStatus;
    if (slotSize) where.slotSize = slotSize;
    if (search) {
      where.OR = [
        { slotNumber: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { block: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [slots, total] = await Promise.all([
      this.prisma.parkingSlot.findMany({
        where,
        skip,
        take: limit,
        include: {
          zone: { select: { name: true, parkingType: true } },
          allocations: {
            where: { isDeleted: false, status: 'ACTIVE' },
            include: {
              vehicle: { select: { vehicleNumber: true, typeCode: true, brand: true } },
              person: { select: { firstName: true, lastName: true } },
            },
            take: 1,
          },
        },
        orderBy: [{ zone: { name: 'asc' } }, { slotNumber: 'asc' }],
      }),
      this.prisma.parkingSlot.count({ where }),
    ]);

    return { data: slots, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateSlotStatus(societyId: string, slotId: string, status: string, actorId: string) {
    const slot = await this.prisma.parkingSlot.findFirst({
      where: { id: slotId, societyId, isDeleted: false },
    });
    if (!slot) throw new NotFoundException('Slot not found');

    return this.prisma.parkingSlot.update({
      where: { id: slotId },
      data: { status: status as any },
    });
  }

  // ─────────────────────────────────────────────
  // 3. VEHICLE REGISTER (unlimited per person)
  // ─────────────────────────────────────────────

  async registerVehicle(societyId: string, dto: CreateVehicleDto, actorId: string) {
    // Check duplicate vehicle number in society
    const existing = await this.prisma.vehicle.findFirst({
      where: { societyId, vehicleNumber: dto.vehicleNumber.toUpperCase(), isDeleted: false },
    });
    if (existing) throw new ConflictException(`Vehicle ${dto.vehicleNumber} already registered`);

    const vehicle = await this.prisma.vehicle.create({
      data: {
        societyId,
        flatId: dto.flatId,
        personId: dto.personId || null,
        vehicleNumber: dto.vehicleNumber.toUpperCase(),
        typeCode: dto.typeCode,
        brand: dto.brand,
        modelName: dto.modelName,
        color: dto.color,
        stickerNumber: dto.stickerNumber,
        rfidTag: dto.rfidTag || null,
        fasTag: dto.fasTag,
        qrToken: uuidv4(),
        registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : null,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : null,
        pucExpiry: dto.pucExpiry ? new Date(dto.pucExpiry) : null,
        fitnessExpiry: dto.fitnessExpiry ? new Date(dto.fitnessExpiry) : null,
        rcDocUrl: dto.rcDocUrl,
        insuranceDocUrl: dto.insuranceDocUrl,
        photoUrl: dto.photoUrl,
        createdBy: actorId,
      },
    });

    await this.logActivity(societyId, 'VEHICLE', vehicle.id, ActivityAction.CREATED, `Vehicle Registered: ${vehicle.vehicleNumber}`, `${vehicle.brand || ''} ${vehicle.modelName || ''}`.trim(), actorId);
    return vehicle;
  }

  async getVehicles(societyId: string, query: QueryParkingDto) {
    const { search, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { modelName: { contains: search, mode: 'insensitive' } },
        { rfidTag: { contains: search, mode: 'insensitive' } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          flat: { select: { flatNumber: true } },
          person: { select: { firstName: true, lastName: true, phone: true } },
          allocations: {
            where: { isDeleted: false, status: 'ACTIVE' },
            include: { slot: { select: { slotNumber: true, zone: { select: { name: true } } } } },
            take: 1,
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data: vehicles, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getVehicle(societyId: string, id: string) {
    const v = await this.prisma.vehicle.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        flat: true,
        person: true,
        allocations: {
          where: { isDeleted: false },
          include: { slot: { include: { zone: true } } },
        },
      },
    });
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  // ─────────────────────────────────────────────
  // 4. PARKING ALLOCATION (PA-00001 auto-number)
  // ─────────────────────────────────────────────

  async createAllocation(societyId: string, dto: CreateAllocationDto, actorId: string) {
    // Validate slot belongs to society and is available
    const slot = await this.prisma.parkingSlot.findFirst({
      where: { id: dto.slotId, societyId, isDeleted: false },
    });
    if (!slot) throw new NotFoundException('Parking slot not found');
    if (slot.status === 'OCCUPIED') {
      throw new ConflictException('This parking slot is already occupied');
    }
    if (slot.status === 'BLOCKED' || slot.status === 'MAINTENANCE') {
      throw new BadRequestException(`Slot is ${slot.status}. Cannot allocate.`);
    }

    // Validate vehicle and person
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, societyId, isDeleted: false },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Auto-generate allocation number
    const count = await this.prisma.parkingAllocation.count({ where: { societyId } });
    const allocationNumber = `PA-${String(count + 1).padStart(5, '0')}`;

    const allocation = await this.prisma.parkingAllocation.create({
      data: {
        societyId,
        slotId: dto.slotId,
        vehicleId: dto.vehicleId,
        personId: dto.personId,
        unitId: dto.unitId || null,
        allocationNumber,
        allocationType: dto.allocationType || 'PERMANENT',
        status: 'ACTIVE',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        monthlyCharge: dto.monthlyCharge || Number(slot.monthlyRate),
        depositPaid: dto.depositPaid || 0,
        notes: dto.notes,
        createdBy: actorId,
      },
      include: { slot: { include: { zone: true } }, vehicle: true, person: true },
    });

    // Mark slot as OCCUPIED
    await this.prisma.parkingSlot.update({
      where: { id: dto.slotId },
      data: { status: 'OCCUPIED' },
    });

    // Notify resident
    await this.notificationsService.send(societyId, {
      recipientType: 'USER',
      recipientId: dto.personId,
      title: `Parking Slot Allocated: ${allocationNumber}`,
      message: `Slot ${slot.slotNumber} in ${(allocation.slot.zone as any).name} has been allocated to your vehicle ${vehicle.vehicleNumber}.`,
      channel: NotificationChannel.IN_APP,
      category: NotificationCategory.INFORMATION,
      priority: NotificationPriority.HIGH,
    });

    await this.logActivity(societyId, 'PARKING_ALLOCATION', allocation.id, ActivityAction.CREATED, `Allocation Created: ${allocationNumber}`, `Slot ${slot.slotNumber} → ${vehicle.vehicleNumber}`, actorId);
    return allocation;
  }

  async getAllocations(societyId: string, query: QueryParkingDto) {
    const { search, allocationType, allocationStatus, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (allocationType) where.allocationType = allocationType;
    if (allocationStatus) where.status = allocationStatus;
    if (search) {
      where.OR = [
        { allocationNumber: { contains: search, mode: 'insensitive' } },
        { vehicle: { vehicleNumber: { contains: search, mode: 'insensitive' } } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
        { slot: { slotNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.parkingAllocation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: { select: { slotNumber: true, floor: true, block: true, zone: { select: { name: true, parkingType: true } } } },
          vehicle: { select: { vehicleNumber: true, typeCode: true, brand: true, color: true } },
          person: { select: { firstName: true, lastName: true, phone: true } },
        },
      }),
      this.prisma.parkingAllocation.count({ where }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async deactivateAllocation(societyId: string, allocationId: string, actorId: string) {
    const alloc = await this.prisma.parkingAllocation.findFirst({
      where: { id: allocationId, societyId, isDeleted: false },
    });
    if (!alloc) throw new NotFoundException('Allocation not found');

    await this.prisma.parkingAllocation.update({
      where: { id: allocationId },
      data: { status: 'CANCELLED', endDate: new Date() },
    });

    // Free up the slot
    await this.prisma.parkingSlot.update({
      where: { id: alloc.slotId },
      data: { status: 'AVAILABLE' },
    });

    await this.logActivity(societyId, 'PARKING_ALLOCATION', allocationId, ActivityAction.UPDATED, 'Allocation Deactivated', '', actorId);
    return { message: 'Allocation cancelled and slot freed' };
  }

  async transferAllocation(societyId: string, allocationId: string, newPersonId: string, actorId: string) {
    const alloc = await this.prisma.parkingAllocation.findFirst({
      where: { id: allocationId, societyId, status: 'ACTIVE', isDeleted: false },
    });
    if (!alloc) throw new NotFoundException('Active allocation not found');

    const updated = await this.prisma.parkingAllocation.update({
      where: { id: allocationId },
      data: {
        personId: newPersonId,
        transferredToPersonId: newPersonId,
        transferredAt: new Date(),
        status: 'TRANSFERRED',
      },
    });

    // Create new active allocation for new owner
    const count = await this.prisma.parkingAllocation.count({ where: { societyId } });
    await this.prisma.parkingAllocation.create({
      data: {
        societyId,
        slotId: alloc.slotId,
        vehicleId: alloc.vehicleId,
        personId: newPersonId,
        unitId: alloc.unitId,
        allocationNumber: `PA-${String(count + 1).padStart(5, '0')}`,
        allocationType: alloc.allocationType,
        status: 'ACTIVE',
        startDate: new Date(),
        monthlyCharge: alloc.monthlyCharge,
        depositPaid: alloc.depositPaid,
        createdBy: actorId,
      },
    });

    await this.logActivity(societyId, 'PARKING_ALLOCATION', allocationId, ActivityAction.UPDATED, 'Allocation Transferred', `To Person: ${newPersonId}`, actorId);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 5. DASHBOARD METRICS
  // ─────────────────────────────────────────────

  async getMetrics(societyId: string) {
    const now = new Date();

    const [slots, allocations, vehicles] = await Promise.all([
      this.prisma.parkingSlot.findMany({
        where: { societyId, isDeleted: false },
        select: { status: true, isEvEnabled: true, slotSize: true },
      }),
      this.prisma.parkingAllocation.findMany({
        where: { societyId, isDeleted: false, status: 'ACTIVE' },
        select: { monthlyCharge: true, allocationType: true },
      }),
      this.prisma.vehicle.findMany({
        where: { societyId, isDeleted: false },
        select: {
          typeCode: true,
          insuranceExpiry: true,
          pucExpiry: true,
          fitnessExpiry: true,
        },
      }),
    ]);

    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
    const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
    const reservedSlots = slots.filter((s) => s.status === 'RESERVED').length;
    const evSlots = slots.filter((s) => s.isEvEnabled).length;
    const monthlyRevenue = allocations.reduce((sum, a) => sum + Number(a.monthlyCharge), 0);

    // Expiry alerts (within 30 days)
    const thirtyDaysAhead = new Date(now);
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    let insuranceExpiring = 0;
    let pucExpiring = 0;
    let fitnessExpiring = 0;

    vehicles.forEach((v) => {
      if (v.insuranceExpiry && v.insuranceExpiry <= thirtyDaysAhead) insuranceExpiring++;
      if (v.pucExpiry && v.pucExpiry <= thirtyDaysAhead) pucExpiring++;
      if (v.fitnessExpiry && v.fitnessExpiry <= thirtyDaysAhead) fitnessExpiring++;
    });

    const utilizationRate = totalSlots > 0 ? Number(((occupiedSlots / totalSlots) * 100).toFixed(1)) : 0;

    return {
      totalSlots,
      availableSlots,
      occupiedSlots,
      reservedSlots,
      evSlots,
      totalVehicles: vehicles.length,
      activeAllocations: allocations.length,
      monthlyRevenue,
      utilizationRate,
      alerts: { insuranceExpiring, pucExpiring, fitnessExpiring },
    };
  }

  // ─────────────────────────────────────────────
  // 6. COMPLIANCE EXPIRY ALERTS
  // ─────────────────────────────────────────────

  async getExpiryAlerts(societyId: string) {
    const now = new Date();
    const thirtyDaysAhead = new Date(now);
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        societyId,
        isDeleted: false,
        OR: [
          { insuranceExpiry: { lte: thirtyDaysAhead } },
          { pucExpiry: { lte: thirtyDaysAhead } },
          { fitnessExpiry: { lte: thirtyDaysAhead } },
        ],
      },
      include: {
        flat: { select: { flatNumber: true } },
        person: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { insuranceExpiry: 'asc' },
    });

    return vehicles.map((v) => ({
      ...v,
      alerts: {
        insurance: v.insuranceExpiry ? v.insuranceExpiry <= now : false,
        puc: v.pucExpiry ? v.pucExpiry <= now : false,
        fitness: v.fitnessExpiry ? v.fitnessExpiry <= now : false,
        insuranceDaysLeft: v.insuranceExpiry
          ? Math.ceil((v.insuranceExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        pucDaysLeft: v.pucExpiry
          ? Math.ceil((v.pucExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
    }));
  }

  // ─────────────────────────────────────────────
  // Private: Activity Timeline Logging
  // ─────────────────────────────────────────────

  private async logActivity(
    societyId: string,
    entityType: string,
    entityId: string,
    action: ActivityAction,
    title: string,
    description: string,
    actorId: string,
  ) {
    return this.prisma.activityTimeline.create({
      data: { societyId, entityType, entityId, action, title, description, actorId },
    });
  }
}
