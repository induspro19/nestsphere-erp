import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateAmcDto } from './dto/create-amc.dto';
import { CreateServiceVisitDto, UpdateServiceVisitDto } from './dto/create-service-visit.dto';
import { QueryVendorAmcDto } from './dto/query-vendor-amc.dto';
import {
  ActivityAction,
  AmcContractStatus,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VendorAmcService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. VENDOR MANAGEMENT
  // ─────────────────────────────────────────────

  async createVendor(societyId: string, dto: CreateVendorDto, actorId: string) {
    const count = await this.prisma.vendor.count({ where: { societyId } });
    const vendorCode = `VEN-${String(count + 1).padStart(5, '0')}`;

    const vendor = await this.prisma.vendor.create({
      data: {
        societyId,
        vendorCode,
        name: dto.name,
        typeCode: dto.typeCode.toUpperCase(),
        status: dto.status || 'ACTIVE',
        gstNumber: dto.gstNumber,
        panNumber: dto.panNumber,
        licenseNumber: dto.licenseNumber,
        primaryEmail: dto.primaryEmail,
        primaryPhone: dto.primaryPhone,
        website: dto.website,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        upiId: dto.upiId,
        isEmergencyContact: dto.isEmergencyContact ?? false,
        isPreferred: dto.isPreferred ?? false,
        notes: dto.notes,
        qrToken: uuidv4(),
        createdBy: actorId,
      },
    });

    await this.logActivity(societyId, 'VENDOR', vendor.id, ActivityAction.CREATED, `Vendor Created: ${vendorCode}`, `${dto.name} — ${dto.typeCode}`, actorId);
    return vendor;
  }

  async getVendors(societyId: string, query: QueryVendorAmcDto) {
    const { search, typeCode, status, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (typeCode) where.typeCode = typeCode;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { vendorCode: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
        { primaryPhone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPreferred: 'desc' }, { name: 'asc' }],
        include: {
          _count: { select: { amcContracts: true, serviceVisits: true, contacts: true } },
          contacts: { where: { isPrimary: true }, take: 1 },
        },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return { data: vendors, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getVendor(societyId: string, vendorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, societyId, isDeleted: false },
      include: {
        contacts: true,
        amcContracts: {
          where: { isDeleted: false },
          orderBy: { startDate: 'desc' },
          include: {
            assetLinks: { include: { asset: { select: { assetCode: true, name: true } } } },
          },
        },
        serviceVisits: {
          where: { isDeleted: false },
          orderBy: { scheduledDate: 'desc' },
          take: 10,
        },
        _count: { select: { amcContracts: true, serviceVisits: true } },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async updateVendor(societyId: string, vendorId: string, dto: Partial<CreateVendorDto>, actorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, societyId, isDeleted: false },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    // Handle blacklist/unblacklist
    if (dto.status === 'BLACKLISTED' || (dto as any).isBlacklisted === true) {
      await this.prisma.vendor.update({ where: { id: vendorId }, data: { isBlacklisted: true, status: 'BLACKLISTED', updatedBy: actorId } });
      await this.logActivity(societyId, 'VENDOR', vendorId, ActivityAction.UPDATED, `Vendor Blacklisted: ${vendor.vendorCode}`, '', actorId);
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { ...(dto as any), updatedBy: actorId },
    });
  }

  async addVendorContact(
    societyId: string,
    vendorId: string,
    contact: { name: string; designation?: string; email?: string; phone: string; isPrimary?: boolean; isEmergency?: boolean },
    actorId: string,
  ) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, societyId, isDeleted: false },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.vendorContact.create({
      data: {
        vendorId,
        name: contact.name,
        designation: contact.designation,
        email: contact.email,
        phone: contact.phone,
        isPrimary: contact.isPrimary ?? false,
        isEmergency: contact.isEmergency ?? false,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 2. AMC CONTRACT MANAGEMENT
  // ─────────────────────────────────────────────

  async createAmc(societyId: string, dto: CreateAmcDto, actorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, societyId, isDeleted: false },
    });
    if (!vendor) throw new NotFoundException('Vendor not found in this society');

    const count = await this.prisma.amcContract.count({ where: { societyId } });
    const amcNumber = `AMC-${String(count + 1).padStart(5, '0')}`;

    const amc = await this.prisma.amcContract.create({
      data: {
        societyId,
        vendorId: dto.vendorId,
        amcNumber,
        contractNumber: dto.contractNumber,
        contractType: dto.contractType,
        status: 'ACTIVE',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        renewalReminderDays: dto.renewalReminderDays ?? 30,
        autoRenew: dto.autoRenew ?? false,
        slaResponseHours: dto.slaResponseHours ?? 4,
        slaResolutionHours: dto.slaResolutionHours ?? 24,
        visitFrequency: dto.visitFrequency,
        contractValue: dto.contractValue ?? 0,
        amcCostPerMonth: dto.amcCostPerMonth ?? 0,
        penaltyPerHour: dto.penaltyPerHour ?? 0,
        insuranceNumber: dto.insuranceNumber,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : null,
        warrantyDetails: dto.warrantyDetails,
        description: dto.description,
        terms: dto.terms,
        createdBy: actorId,
      },
    });

    // Link assets if provided
    if (dto.assetIds && dto.assetIds.length > 0) {
      await this.prisma.amcAssetLink.createMany({
        data: dto.assetIds.map((assetId) => ({ amcId: amc.id, assetId })),
        skipDuplicates: true,
      });
    }

    // Update vendor stats
    await this.prisma.vendor.update({
      where: { id: dto.vendorId },
      data: {
        totalContracts: { increment: 1 },
        totalContractValue: { increment: dto.contractValue ?? 0 },
      },
    });

    await this.logActivity(societyId, 'AMC_CONTRACT', amc.id, ActivityAction.CREATED, `AMC Created: ${amcNumber}`, `${vendor.name} — ${dto.contractType}`, actorId);
    return amc;
  }

  async getAmcContracts(societyId: string, query: QueryVendorAmcDto) {
    const { search, vendorId, contractType, contractStatus, renewalDays, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;
    if (contractType) where.contractType = contractType;
    if (contractStatus) where.status = contractStatus;
    if (search) {
      where.OR = [
        { amcNumber: { contains: search, mode: 'insensitive' } },
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (renewalDays) {
      const future = new Date();
      future.setDate(future.getDate() + renewalDays);
      where.endDate = { lte: future };
      where.status = AmcContractStatus.ACTIVE;
    }

    const [amcs, total] = await Promise.all([
      this.prisma.amcContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { endDate: 'asc' },
        include: {
          vendor: { select: { vendorCode: true, name: true, typeCode: true, primaryPhone: true } },
          assetLinks: {
            include: { asset: { select: { assetCode: true, name: true } } },
          },
          _count: { select: { serviceVisits: true } },
        },
      }),
      this.prisma.amcContract.count({ where }),
    ]);

    // Annotate with days until expiry
    const now = new Date();
    const annotated = amcs.map((a) => ({
      ...a,
      daysToExpiry: Math.ceil((new Date(a.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return { data: annotated, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateAmcStatus(societyId: string, amcId: string, status: AmcContractStatus, actorId: string) {
    const amc = await this.prisma.amcContract.findFirst({
      where: { id: amcId, societyId, isDeleted: false },
    });
    if (!amc) throw new NotFoundException('AMC contract not found');

    const updated = await this.prisma.amcContract.update({
      where: { id: amcId },
      data: { status },
    });
    await this.logActivity(societyId, 'AMC_CONTRACT', amcId, ActivityAction.UPDATED, `AMC Status Changed: ${amc.amcNumber}`, `New Status: ${status}`, actorId);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 3. SERVICE VISITS
  // ─────────────────────────────────────────────

  async createServiceVisit(societyId: string, dto: CreateServiceVisitDto, actorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, societyId, isDeleted: false },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const count = await this.prisma.serviceVisit.count({ where: { societyId } });
    const visitNumber = `SV-${String(count + 1).padStart(5, '0')}`;

    const visit = await this.prisma.serviceVisit.create({
      data: {
        societyId,
        vendorId: dto.vendorId,
        amcId: dto.amcId || null,
        visitNumber,
        visitType: dto.visitType,
        status: 'SCHEDULED',
        scheduledDate: new Date(dto.scheduledDate),
        technicianName: dto.technicianName,
        technicianPhone: dto.technicianPhone,
        workDescription: dto.workDescription,
        checklist: dto.checklist as any,
        reportedAt: new Date(),
        createdBy: actorId,
      },
    });

    await this.logActivity(societyId, 'SERVICE_VISIT', visit.id, ActivityAction.CREATED, `Service Visit Scheduled: ${visitNumber}`, `${vendor.name} — ${dto.visitType}`, actorId);
    return visit;
  }

  async getServiceVisits(societyId: string, query: QueryVendorAmcDto) {
    const { search, vendorId, visitType, visitStatus, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;
    if (visitType) where.visitType = visitType;
    if (visitStatus) where.status = visitStatus;
    if (search) {
      where.OR = [
        { visitNumber: { contains: search, mode: 'insensitive' } },
        { technicianName: { contains: search, mode: 'insensitive' } },
        { society: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [visits, total] = await Promise.all([
      this.prisma.serviceVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          society: { select: { name: true, vendorCode: true, typeCode: true } },
          amc: { select: { amcNumber: true, contractType: true } },
        },
      }),
      this.prisma.serviceVisit.count({ where }),
    ]);

    return { data: visits, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateServiceVisit(societyId: string, visitId: string, dto: UpdateServiceVisitDto, actorId: string) {
    const visit = await this.prisma.serviceVisit.findFirst({
      where: { id: visitId, societyId, isDeleted: false },
    });
    if (!visit) throw new NotFoundException('Service visit not found');

    const updateData: any = { ...dto };
    if (dto.status === 'IN_PROGRESS' && !visit.respondedAt) {
      updateData.respondedAt = new Date();
      if (visit.reportedAt) {
        updateData.responseMinutes = Math.round(
          (new Date().getTime() - visit.reportedAt.getTime()) / 60000,
        );
      }
    }
    if (dto.status === 'COMPLETED') {
      updateData.completedAt = new Date();
      const totalCost = (dto.labourCost || 0) + (dto.materialCost || 0);
      updateData.totalCost = totalCost;
      if (dto.signatureUrl) updateData.hasDigitalSignature = true;
    }
    if (dto.actualDate) updateData.actualDate = new Date(dto.actualDate);

    const updated = await this.prisma.serviceVisit.update({
      where: { id: visitId },
      data: updateData,
    });

    await this.logActivity(societyId, 'SERVICE_VISIT', visitId, ActivityAction.UPDATED, `Service Visit Updated: ${visit.visitNumber}`, `Status: ${dto.status || 'Updated'}`, actorId);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 4. DASHBOARD METRICS
  // ─────────────────────────────────────────────

  async getMetrics(societyId: string) {
    const now = new Date();
    const thirtyDays = new Date(now);
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const [vendors, amcs, visits] = await Promise.all([
      this.prisma.vendor.findMany({
        where: { societyId, isDeleted: false },
        select: { status: true, isBlacklisted: true, isPreferred: true, totalContractValue: true, rating: true },
      }),
      this.prisma.amcContract.findMany({
        where: { societyId, isDeleted: false },
        select: { status: true, endDate: true, contractValue: true, amcCostPerMonth: true },
      }),
      this.prisma.serviceVisit.findMany({
        where: { societyId, isDeleted: false },
        select: { status: true, totalCost: true, penaltyAmount: true, visitType: true },
      }),
    ]);

    const activeVendors = vendors.filter((v) => v.status === 'ACTIVE').length;
    const blacklistedVendors = vendors.filter((v) => v.isBlacklisted).length;
    const preferredVendors = vendors.filter((v) => v.isPreferred).length;

    const activeAmcs = amcs.filter((a) => a.status === 'ACTIVE').length;
    const expiredAmcs = amcs.filter((a) => a.status === 'EXPIRED').length;
    const expiringAmcs = amcs.filter((a) => a.status === 'ACTIVE' && new Date(a.endDate) <= thirtyDays).length;
    const totalAmcValue = amcs.reduce((s, a) => s + Number(a.contractValue), 0);
    const monthlyAmcCost = amcs.filter((a) => a.status === 'ACTIVE').reduce((s, a) => s + Number(a.amcCostPerMonth), 0);

    const completedVisits = visits.filter((v) => v.status === 'COMPLETED').length;
    const pendingVisits = visits.filter((v) => v.status === 'SCHEDULED' || v.status === 'IN_PROGRESS').length;
    const totalServiceCost = visits.reduce((s, v) => s + Number(v.totalCost), 0);
    const totalPenalty = visits.reduce((s, v) => s + Number(v.penaltyAmount), 0);

    const avgRating = vendors.length > 0
      ? Number((vendors.reduce((s, v) => s + Number(v.rating), 0) / vendors.length).toFixed(2))
      : 0;

    return {
      vendors: { total: vendors.length, active: activeVendors, blacklisted: blacklistedVendors, preferred: preferredVendors, avgRating },
      amcs: { total: amcs.length, active: activeAmcs, expired: expiredAmcs, expiringIn30Days: expiringAmcs, totalValue: totalAmcValue, monthlyRecurring: monthlyAmcCost },
      visits: { total: visits.length, completed: completedVisits, pending: pendingVisits, totalCost: totalServiceCost, totalPenalty },
    };
  }

  // ─────────────────────────────────────────────
  // Private: Activity Timeline
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
