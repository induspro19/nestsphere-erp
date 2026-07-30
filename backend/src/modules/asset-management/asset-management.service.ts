import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { LogAssetServiceDto } from './dto/log-asset-service.dto';
import { QueryAssetDto } from './dto/query-asset.dto';
import { ActivityAction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssetManagementService {
  constructor(private prisma: PrismaService) {}

  // 1. Seed & Retrieve Asset Categories (24 Categories)
  async getCategories(societyId: string) {
    const existing = await this.prisma.assetCategory.findMany({
      where: { OR: [{ societyId }, { societyId: null }] },
    });

    if (existing.length === 0) {
      const defaultCategories = [
        { code: 'BUILDINGS', name: 'Buildings & Towers' },
        { code: 'LIFTS', name: 'Lifts & Elevators' },
        { code: 'DG_SETS', name: 'DG Power Generators' },
        { code: 'FIRE_PUMPS', name: 'Fire Fighting Pumps' },
        { code: 'FIRE_HYDRANTS', name: 'Fire Hydrants & Extinguishers' },
        { code: 'FIRE_ALARMS', name: 'Fire Alarm Panels' },
        { code: 'CCTV', name: 'CCTV Surveillance System' },
        { code: 'BOOM_BARRIERS', name: 'Automatic Boom Barriers' },
        { code: 'RFID_READERS', name: 'RFID & Gate Readers' },
        { code: 'SOLAR_SYSTEM', name: 'Solar Rooftop & Inverters' },
        { code: 'WATER_TANKS', name: 'Overhead & Underground Water Tanks' },
        { code: 'PIPELINES', name: 'Plumbing & Drainage Pipelines' },
        { code: 'STP', name: 'Sewage Treatment Plant (STP)' },
        { code: 'WTP', name: 'Water Treatment Plant (WTP)' },
        { code: 'GYM_EQUIPMENT', name: 'Gymnasium Equipment' },
        { code: 'SWIMMING_POOL', name: 'Swimming Pool & Filtration' },
        { code: 'EV_CHARGERS', name: 'EV Charging Stations' },
        { code: 'GARDEN_EQUIPMENT', name: 'Lawn & Garden Equipment' },
        { code: 'STREET_LIGHTS', name: 'Street & Common Lighting' },
        { code: 'PARKING_AREAS', name: 'Parking Infrastructure' },
        { code: 'COMMON_AREAS', name: 'Common Facility Amenities' },
        { code: 'PLAY_AREA', name: 'Children Play Equipment' },
        { code: 'CLUB_HOUSE', name: 'Club House Equipment' },
        { code: 'OFFICE_EQUIPMENT', name: 'Society Office Equipment' },
      ];

      await this.prisma.assetCategory.createMany({
        data: defaultCategories.map((c) => ({
          societyId,
          code: c.code,
          name: c.name,
        })),
      });

      return this.prisma.assetCategory.findMany({ where: { societyId } });
    }

    return existing;
  }

  // 2. Get Paginated Asset List with Filters
  async findAll(societyId: string, query: QueryAssetDto) {
    const { search, categoryId, status, buildingId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      societyId,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { vendorName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (buildingId) where.buildingId = buildingId;

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          building: true,
          wing: true,
          logs: { orderBy: { logDate: 'desc' }, take: 3 },
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Get Single Asset Details & QR Card
  async findOne(societyId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        category: true,
        building: true,
        wing: true,
        logs: { orderBy: { logDate: 'desc' } },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset profile not found');
    }

    return asset;
  }

  // 4. Create Asset Record
  async create(societyId: string, dto: CreateAssetDto, actorId: string) {
    const count = await this.prisma.asset.count({ where: { societyId } });
    const assetCode = `AST-${String(count + 1).padStart(5, '0')}`;
    const qrToken = `QR-AST-${uuidv4()}`;

    const now = new Date();
    const intervalDays = dto.maintenanceIntervalDays || 30;
    const nextServiceDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    const asset = await this.prisma.asset.create({
      data: {
        societyId,
        categoryId: dto.categoryId,
        assetCode,
        qrToken,
        name: dto.name,
        brand: dto.brand,
        modelNumber: dto.modelNumber,
        serialNumber: dto.serialNumber,
        barcode: dto.barcode,
        rfidTag: dto.rfidTag,
        buildingId: dto.buildingId || null,
        wingId: dto.wingId || null,
        locationDetails: dto.locationDetails,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        installationDate: dto.installationDate ? new Date(dto.installationDate) : null,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : null,
        amcExpiry: dto.amcExpiry ? new Date(dto.amcExpiry) : null,
        vendorName: dto.vendorName,
        vendorPhone: dto.vendorPhone,
        purchaseCost: dto.purchaseCost || 0,
        currentValue: dto.currentValue || dto.purchaseCost || 0,
        depreciationRate: dto.depreciationRate || 0,
        maintenanceIntervalDays: intervalDays,
        nextServiceDate,
        personResponsibleId: dto.personResponsibleId || null,
        status: dto.status || 'OPERATIONAL',
        photos: dto.photos || [],
        documents: dto.documents || [],
        spareParts: dto.spareParts || [],
        createdBy: actorId,
      },
      include: { category: true },
    });

    // Log Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'ASSET',
        entityId: asset.id,
        action: ActivityAction.CREATED,
        title: `Asset Registered (${assetCode})`,
        description: `${asset.name} added to Asset Inventory`,
        actorId,
      },
    });

    return asset;
  }

  // 5. Update Asset Record
  async update(societyId: string, id: string, dto: UpdateAssetDto, actorId: string) {
    const existing = await this.findOne(societyId, id);

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        brand: dto.brand,
        modelNumber: dto.modelNumber,
        serialNumber: dto.serialNumber,
        barcode: dto.barcode,
        rfidTag: dto.rfidTag,
        buildingId: dto.buildingId,
        wingId: dto.wingId,
        locationDetails: dto.locationDetails,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        installationDate: dto.installationDate ? new Date(dto.installationDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        amcExpiry: dto.amcExpiry ? new Date(dto.amcExpiry) : undefined,
        vendorName: dto.vendorName,
        vendorPhone: dto.vendorPhone,
        purchaseCost: dto.purchaseCost,
        currentValue: dto.currentValue,
        depreciationRate: dto.depreciationRate,
        status: dto.status,
        photos: dto.photos as any,
        documents: dto.documents as any,
        spareParts: dto.spareParts as any,
        updatedBy: actorId,
      },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'ASSET',
        entityId: id,
        action: ActivityAction.UPDATED,
        title: `Asset Updated (${existing.assetCode})`,
        description: `Updated profile details for ${existing.name}`,
        actorId,
      },
    });

    return updated;
  }

  // 6. Log Service / Inspection Event
  async logServiceEvent(societyId: string, assetId: string, dto: LogAssetServiceDto, actorId: string) {
    const asset = await this.findOne(societyId, assetId);

    const now = new Date();
    const nextServiceDate = new Date(now.getTime() + asset.maintenanceIntervalDays * 24 * 60 * 60 * 1000);

    const serviceLog = await this.prisma.assetLog.create({
      data: {
        assetId,
        logType: dto.logType,
        title: dto.title,
        description: dto.description,
        cost: dto.cost || 0,
        performedBy: dto.performedBy || 'Technician',
      },
    });

    // Update Asset Maintenance Dates
    await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        lastServiceDate: now,
        nextServiceDate,
        status: dto.logType === 'BREAKDOWN' ? 'UNDER_MAINTENANCE' : 'OPERATIONAL',
      },
    });

    return serviceLog;
  }

  // 7. Asset Dashboard Metrics
  async getMetrics(societyId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { societyId, isDeleted: false },
      select: {
        status: true,
        purchaseCost: true,
        currentValue: true,
        nextServiceDate: true,
      },
    });

    const totalAssets = assets.length;
    let totalValuation = 0;
    let operationalCount = 0;
    let maintenanceCount = 0;
    let breakdownCount = 0;

    const now = new Date();
    let serviceDueCount = 0;

    assets.forEach((a) => {
      totalValuation += Number(a.currentValue || a.purchaseCost || 0);
      if (a.status === 'OPERATIONAL') operationalCount++;
      if (a.status === 'UNDER_MAINTENANCE') maintenanceCount++;
      if (a.status === 'OUT_OF_SERVICE') breakdownCount++;
      if (a.nextServiceDate && new Date(a.nextServiceDate) <= now) serviceDueCount++;
    });

    return {
      totalAssets,
      totalValuation,
      operationalCount,
      maintenanceCount,
      breakdownCount,
      serviceDueCount,
    };
  }

  // 8. Bulk Export Asset Registry
  async bulkExport(societyId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { societyId, isDeleted: false },
      include: { category: true, building: true },
    });

    return assets.map((a) => ({
      AssetCode: a.assetCode,
      Name: a.name,
      Category: a.category.name,
      Brand: a.brand || '',
      ModelNumber: a.modelNumber || '',
      SerialNumber: a.serialNumber || '',
      Status: a.status,
      Location: a.locationDetails || a.building?.name || '',
      Vendor: a.vendorName || '',
      PurchaseCost: a.purchaseCost,
      CurrentValue: a.currentValue,
      LastService: a.lastServiceDate ? a.lastServiceDate.toISOString() : '',
      NextService: a.nextServiceDate ? a.nextServiceDate.toISOString() : '',
    }));
  }

  // 9. Soft Delete Asset
  async remove(societyId: string, id: string, actorId: string) {
    const existing = await this.findOne(societyId, id);

    await this.prisma.asset.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: actorId },
    });

    return { message: `Asset ${existing.assetCode} soft-deleted` };
  }
}
