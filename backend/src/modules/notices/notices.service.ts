import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityAction } from '@prisma/client';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticeQueryDto } from './dto/notice-query.dto';
import { CreateNoticeTemplateDto } from './dto/create-notice-template.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Executive Dashboard Metrics
  async getMetrics(societyId: string) {
    const [
      activeNotices,
      pendingApproval,
      criticalNotices,
      allRecipients,
    ] = await Promise.all([
      this.prisma.notice.count({
        where: { societyId, isDeleted: false, status: 'PUBLISHED' },
      }),
      this.prisma.notice.count({
        where: { societyId, isDeleted: false, status: 'PENDING_APPROVAL' },
      }),
      this.prisma.notice.count({
        where: { societyId, isDeleted: false, priority: { in: ['CRITICAL', 'EMERGENCY'] }, status: 'PUBLISHED' },
      }),
      this.prisma.noticeRecipient.findMany({
        where: { notice: { societyId, isDeleted: false } },
        select: { acknowledgementStatus: true },
      }),
    ]);

    const totalRecipients = allRecipients.length;
    const acknowledgedCount = allRecipients.filter((r) => r.acknowledgementStatus === 'ACKNOWLEDGED' || r.acknowledgementStatus === 'READ').length;
    const acknowledgementRate = totalRecipients > 0 ? Math.round((acknowledgedCount / totalRecipients) * 100) : 100;

    return {
      activeNotices,
      pendingApproval,
      criticalNotices,
      acknowledgementRate,
    };
  }

  // 2. Search & Filter Notices with Pagination
  async findAll(societyId: string, query?: NoticeQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      societyId,
      isDeleted: false,
      ...(query?.category ? { category: query.category } : {}),
      ...(query?.priority ? { priority: query.priority } : {}),
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { noticeNumber: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.notice.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Get Single Notice Details
  async findOne(societyId: string, id: string) {
    const notice = await this.prisma.notice.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        recipients: {
          include: {
            person: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          take: 50,
        },
      },
    });

    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  // 4. Create Notice (NTC-00001 Auto Numbering)
  async createNotice(societyId: string, dto: CreateNoticeDto, actorId: string) {
    const count = await this.prisma.notice.count({ where: { societyId } });
    const noticeNumber = `NTC-${String(count + 1).padStart(5, '0')}`;

    const requiresApproval = dto.requiresApproval || false;
    const initialStatus = requiresApproval ? 'PENDING_APPROVAL' : 'PUBLISHED';

    const notice = await this.prisma.notice.create({
      data: {
        societyId,
        noticeNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority || 'MEDIUM',
        status: initialStatus,
        publishDate: dto.publishDate ? new Date(dto.publishDate) : new Date(),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        requiresApproval,
        requiresAcknowledgement: dto.requiresAcknowledgement || false,
        createdById: actorId,
      },
    });

    // Populate Recipients (All active residents in society)
    const societyPeople = await this.prisma.person.findMany({
      where: { societyId, isDeleted: false, status: 'ACTIVE' },
      select: { id: true },
      take: 100,
    });

    if (societyPeople.length > 0) {
      await this.prisma.noticeRecipient.createMany({
        data: societyPeople.map((p) => ({
          noticeId: notice.id,
          personId: p.id,
          targetType: dto.targetType || 'ENTIRE_SOCIETY',
          acknowledgementStatus: 'PENDING',
        })),
      });
    }

    // Activity Timeline Entry
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'NOTICE',
        entityId: notice.id,
        action: ActivityAction.CREATED,
        title: `Notice Created (${notice.noticeNumber})`,
        description: `Notice titled "${notice.title}" created with priority ${notice.priority}.`,
        actorId,
      },
    });

    // Dispatch Notification
    await this.prisma.notification.create({
      data: {
        societyId,
        userId: actorId,
        title: `Notice Published: ${dto.title}`,
        message: `Official notice ${noticeNumber} (${dto.category}) published.`,
        category: 'INFORMATION',
        channel: 'IN_APP',
      },
    });

    return notice;
  }

  // 5. Update Notice
  async updateNotice(societyId: string, id: string, dto: UpdateNoticeDto, actorId: string) {
    const existing = await this.prisma.notice.findFirst({ where: { id, societyId, isDeleted: false } });
    if (!existing) throw new NotFoundException('Notice not found');

    const updated = await this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.category ? { category: dto.category } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.expiryDate ? { expiryDate: new Date(dto.expiryDate) } : {}),
        ...(dto.requiresAcknowledgement !== undefined ? { requiresAcknowledgement: dto.requiresAcknowledgement } : {}),
      },
    });

    return updated;
  }

  // 6. Approve Notice
  async approveNotice(societyId: string, id: string, actorId: string) {
    const notice = await this.prisma.notice.findFirst({ where: { id, societyId, isDeleted: false } });
    if (!notice) throw new NotFoundException('Notice not found');

    const updated = await this.prisma.notice.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        approvedById: actorId,
        publishDate: new Date(),
      },
    });

    return updated;
  }

  // 7. Acknowledge Notice
  async acknowledgeNotice(societyId: string, noticeId: string, personId: string) {
    const recipient = await this.prisma.noticeRecipient.findFirst({
      where: { noticeId, personId },
    });

    if (!recipient) {
      return this.prisma.noticeRecipient.create({
        data: {
          noticeId,
          personId,
          acknowledgementStatus: 'ACKNOWLEDGED',
          readAt: new Date(),
          acknowledgedAt: new Date(),
        },
      });
    }

    return this.prisma.noticeRecipient.update({
      where: { id: recipient.id },
      data: {
        acknowledgementStatus: 'ACKNOWLEDGED',
        readAt: recipient.readAt || new Date(),
        acknowledgedAt: new Date(),
      },
    });
  }

  // 8. Soft Delete Notice
  async removeNotice(societyId: string, id: string, actorId: string) {
    const notice = await this.prisma.notice.findFirst({ where: { id, societyId, isDeleted: false } });
    if (!notice) throw new NotFoundException('Notice not found');

    return this.prisma.notice.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // 9. Templates Management
  async getTemplates(societyId: string) {
    return this.prisma.noticeTemplate.findMany({
      where: { societyId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(societyId: string, dto: CreateNoticeTemplateDto) {
    return this.prisma.noticeTemplate.create({
      data: {
        societyId,
        templateName: dto.templateName,
        category: dto.category,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  // 10. Dashboard Widgets Export for Analytics Engine
  async getDashboardWidgets(societyId: string) {
    const metrics = await this.getMetrics(societyId);
    return [
      {
        widgetKey: 'NOTICE_ACTIVE_COUNT',
        title: 'Active Published Notices',
        value: metrics.activeNotices,
        unit: 'Notices',
        category: 'NOTICES',
      },
      {
        widgetKey: 'NOTICE_PENDING_APPROVAL',
        title: 'Pending Approval Notices',
        value: metrics.pendingApproval,
        unit: 'Notices',
        category: 'NOTICES',
      },
      {
        widgetKey: 'NOTICE_CRITICAL_COUNT',
        title: 'Emergency Notices',
        value: metrics.criticalNotices,
        unit: 'Alerts',
        category: 'NOTICES',
      },
      {
        widgetKey: 'NOTICE_ACK_RATE',
        title: 'Notice Acknowledgement Rate',
        value: metrics.acknowledgementRate,
        unit: '%',
        category: 'NOTICES',
      },
    ];
  }
}
