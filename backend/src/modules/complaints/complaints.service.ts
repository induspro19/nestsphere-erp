import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { ActivityAction, NotificationCategory, NotificationChannel, NotificationPriority } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 1. Create Complaint Ticket
  async create(societyId: string, dto: CreateComplaintDto, actorId: string) {
    const count = await this.prisma.complaint.count({ where: { societyId } });
    const ticketNumber = `CMP-${String(count + 1).padStart(5, '0')}`;

    // Get primary reporter person if not provided
    let reporterId = dto.reportedById;
    if (!reporterId) {
      const person = await this.prisma.person.findFirst({ where: { societyId, isDeleted: false } });
      reporterId = person?.id || actorId;
    }

    const slaHours = dto.slaHours || 24;
    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const complaint = await this.prisma.complaint.create({
      data: {
        societyId,
        ticketNumber,
        category: dto.category,
        priority: dto.priority || 'MEDIUM',
        subject: dto.subject,
        description: dto.description,
        reportedById: reporterId,
        unitId: dto.unitId || null,
        assetId: dto.assetId || null,
        slaHours,
        slaDueDate,
        createdBy: actorId,
      },
      include: {
        reportedBy: true,
        unit: true,
        asset: true,
      },
    });

    // Notify maintenance staff
    await this.notificationsService.send(societyId, {
      recipientType: 'ROLE',
      recipientId: 'MAINTENANCE_STAFF',
      title: `New Ticket Logged: ${ticketNumber}`,
      message: `${dto.category} complaint reported: "${dto.subject}"`,
      channel: NotificationChannel.IN_APP,
      category: NotificationCategory.COMPLAINT,
      priority: NotificationPriority.HIGH,
    });

    // Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'COMPLAINT',
        entityId: complaint.id,
        action: ActivityAction.CREATED,
        title: `Ticket Logged (${ticketNumber})`,
        description: `${dto.category} - ${dto.subject}`,
        actorId,
      },
    });

    return complaint;
  }

  // 2. Query All Complaints
  async findAll(societyId: string, query: QueryComplaintsDto) {
    const { search, category, status, priority, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: true,
          unit: true,
          asset: true,
          assignedStaff: { include: { staff: true } },
        },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 3. Get Single Complaint Details
  async findOne(societyId: string, id: string) {
    const complaint = await this.prisma.complaint.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        reportedBy: true,
        unit: true,
        asset: true,
        assignedStaff: { include: { staff: true } },
        workflowInstance: true,
      },
    });

    if (!complaint) throw new NotFoundException('Complaint ticket not found');
    return complaint;
  }

  // 4. Update Ticket & Status Progression
  async update(societyId: string, id: string, dto: UpdateComplaintDto, actorId: string) {
    const existing = await this.findOne(societyId, id);

    const updateData: any = {};
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === 'RESOLVED') updateData.resolvedAt = new Date();
      if (dto.status === 'CLOSED') updateData.closedAt = new Date();
    }

    if (dto.priority) updateData.priority = dto.priority;
    if (dto.assignedVendorName !== undefined) updateData.assignedVendorName = dto.assignedVendorName;
    if (dto.resolutionNotes !== undefined) updateData.resolutionNotes = dto.resolutionNotes;
    if (dto.rootCause !== undefined) updateData.rootCause = dto.rootCause;
    if (dto.correctiveAction !== undefined) updateData.correctiveAction = dto.correctiveAction;
    if (dto.preventiveAction !== undefined) updateData.preventiveAction = dto.preventiveAction;
    if (dto.cost !== undefined) updateData.cost = dto.cost;
    if (dto.starRating !== undefined) updateData.starRating = dto.starRating;
    if (dto.residentFeedback !== undefined) updateData.residentFeedback = dto.residentFeedback;

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        reportedBy: true,
        unit: true,
        asset: true,
      },
    });

    // Handle Staff Assignment
    if (dto.assignedStaffId) {
      await this.prisma.staffComplaintAssignment.upsert({
        where: { complaintId_staffId: { complaintId: id, staffId: dto.assignedStaffId } },
        create: { complaintId: id, staffId: dto.assignedStaffId },
        update: {},
      });
    }

    // Activity Log
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'COMPLAINT',
        entityId: id,
        action: ActivityAction.UPDATED,
        title: `Ticket ${existing.ticketNumber} Updated`,
        description: `Status changed to ${dto.status || existing.status}`,
        actorId,
      },
    });

    return updated;
  }

  // 5. Helpdesk Dashboard Metrics
  async getMetrics(societyId: string) {
    const complaints = await this.prisma.complaint.findMany({
      where: { societyId, isDeleted: false },
      select: { status: true, priority: true, cost: true, slaDueDate: true, isEscalated: true },
    });

    const now = new Date();
    let totalOpen = 0;
    let totalInProgress = 0;
    let totalResolved = 0;
    let totalOverdue = 0;
    let totalCost = 0;

    complaints.forEach((c) => {
      if (c.status === 'OPEN') totalOpen++;
      if (c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED') totalInProgress++;
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') totalResolved++;
      if (c.slaDueDate && new Date(c.slaDueDate) < now && c.status !== 'RESOLVED' && c.status !== 'CLOSED') {
        totalOverdue++;
      }
      totalCost += Number(c.cost || 0);
    });

    return {
      totalTickets: complaints.length,
      totalOpen,
      totalInProgress,
      totalResolved,
      totalOverdue,
      totalCost,
    };
  }
}
