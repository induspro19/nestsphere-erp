import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { ActivityAction, NotificationCategory, NotificationChannel, NotificationPriority } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 1. Create Work Order (Auto WO-00001 Generator)
  async create(societyId: string, dto: CreateWorkOrderDto, actorId: string) {
    const count = await this.prisma.workOrder.count({ where: { societyId } });
    const workOrderNumber = `WO-${String(count + 1).padStart(5, '0')}`;

    const scheduledDate = dto.scheduledDate ? new Date(dto.scheduledDate) : new Date();

    const workOrder = await this.prisma.workOrder.create({
      data: {
        societyId,
        workOrderNumber,
        type: dto.type || 'PREVENTIVE',
        priority: dto.priority || 'MEDIUM',
        title: dto.title,
        description: dto.description,
        assetId: dto.assetId,
        complaintId: dto.complaintId || null,
        assignedStaffId: dto.assignedStaffId || null,
        assignedVendorName: dto.assignedVendorName || null,
        scheduledDate,
        createdBy: actorId,
      },
      include: {
        asset: true,
        complaint: true,
        assignedStaff: true,
      },
    });

    // Update asset status to UNDER_MAINTENANCE
    await this.prisma.asset.update({
      where: { id: dto.assetId },
      data: { status: 'UNDER_MAINTENANCE' },
    });

    // Send Notification
    await this.notificationsService.send(societyId, {
      recipientType: 'ROLE',
      recipientId: 'MAINTENANCE_STAFF',
      title: `Work Order Assigned: ${workOrderNumber}`,
      message: `${dto.type} maintenance scheduled for asset: "${workOrder.asset.name}"`,
      channel: NotificationChannel.IN_APP,
      category: NotificationCategory.SECURITY,
      priority: NotificationPriority.HIGH,
    });

    // Activity Log
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'WORK_ORDER',
        entityId: workOrder.id,
        action: ActivityAction.CREATED,
        title: `Work Order Created (${workOrderNumber})`,
        description: `${dto.type} - ${dto.title}`,
        actorId,
      },
    });

    return workOrder;
  }

  // 2. Query All Work Orders
  async findAll(societyId: string, query: QueryMaintenanceDto) {
    const { search, type, status, priority, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };

    if (search) {
      where.OR = [
        { workOrderNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          asset: true,
          complaint: true,
          assignedStaff: true,
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 3. Get Single Work Order
  async findOne(societyId: string, id: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        asset: true,
        complaint: true,
        assignedStaff: true,
      },
    });

    if (!wo) throw new NotFoundException('Work Order not found');
    return wo;
  }

  // 4. Update Work Order Status & Cost Breakdown
  async update(societyId: string, id: string, dto: UpdateWorkOrderDto, actorId: string) {
    const existing = await this.findOne(societyId, id);

    const updateData: any = {};
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === 'COMPLETED' || dto.status === 'VERIFIED') {
        updateData.completedAt = new Date();
        // Set asset back to OPERATIONAL
        await this.prisma.asset.update({
          where: { id: existing.assetId },
          data: { status: 'OPERATIONAL', lastServiceDate: new Date() },
        });
      }
    }

    if (dto.priority) updateData.priority = dto.priority;
    if (dto.assignedStaffId) updateData.assignedStaffId = dto.assignedStaffId;
    if (dto.assignedVendorName !== undefined) updateData.assignedVendorName = dto.assignedVendorName;
    if (dto.downtimeHours !== undefined) updateData.downtimeHours = dto.downtimeHours;
    if (dto.labourCost !== undefined) updateData.labourCost = dto.labourCost;
    if (dto.materialCost !== undefined) updateData.materialCost = dto.materialCost;

    const totalCost = (dto.labourCost || Number(existing.labourCost)) + (dto.materialCost || Number(existing.materialCost));
    updateData.totalCost = totalCost;

    if (dto.rootCause !== undefined) updateData.rootCause = dto.rootCause;
    if (dto.correctiveAction !== undefined) updateData.correctiveAction = dto.correctiveAction;
    if (dto.preventiveAction !== undefined) updateData.preventiveAction = dto.preventiveAction;

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: { asset: true, assignedStaff: true },
    });

    // Also Log in Asset Maintenance Log
    if (dto.status === 'COMPLETED') {
      await this.prisma.assetLog.create({
        data: {
          assetId: existing.assetId,
          logType: existing.type === 'PREVENTIVE' ? 'SERVICE' : 'BREAKDOWN',
          title: `Work Order Completed (${existing.workOrderNumber})`,
          description: dto.correctiveAction || existing.description,
          cost: totalCost,
          performedBy: updated.assignedStaff ? `${updated.assignedStaff.firstName} ${updated.assignedStaff.lastName}` : dto.assignedVendorName || 'Technician',
        },
      });
    }

    return updated;
  }

  // 5. Maintenance MTTR & Reliability Metrics
  async getMetrics(societyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { societyId, isDeleted: false },
      select: { type: true, status: true, downtimeHours: true, totalCost: true },
    });

    let totalPreventive = 0;
    let totalCorrective = 0;
    let totalCompleted = 0;
    let totalDowntimeHours = 0;
    let totalMaintenanceCost = 0;

    workOrders.forEach((w) => {
      if (w.type === 'PREVENTIVE') totalPreventive++;
      if (w.type === 'CORRECTIVE' || w.type === 'BREAKDOWN') totalCorrective++;
      if (w.status === 'COMPLETED' || w.status === 'VERIFIED') totalCompleted++;
      totalDowntimeHours += w.downtimeHours || 0;
      totalMaintenanceCost += Number(w.totalCost || 0);
    });

    const averageMTTR = totalCompleted > 0 ? Number((totalDowntimeHours / totalCompleted).toFixed(2)) : 0;

    return {
      totalWorkOrders: workOrders.length,
      totalPreventive,
      totalCorrective,
      totalCompleted,
      totalDowntimeHours,
      totalMaintenanceCost,
      averageMTTR,
    };
  }
}
