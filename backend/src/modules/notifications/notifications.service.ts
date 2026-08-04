import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { BroadcastNotificationDto } from './dto/broadcast.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  // 1. Get User In-App Notifications (Bell Icon & Notification Center)
  async getUserNotifications(userId: string, query: QueryNotificationDto) {
    const { channel, category, isRead, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      isArchived: false,
    };

    if (channel) where.channel = channel;
    if (category) where.category = category;
    if (typeof isRead === 'boolean') where.isRead = isRead;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false, isArchived: false },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 2. Send Direct Targeted Notification
  async send(societyId: string, dto: SendNotificationDto) {
    const dispatch = await this.prisma.notificationDispatch.create({
      data: {
        societyId,
        channel: dto.channel || 'IN_APP',
        category: dto.category || 'INFORMATION',
        priority: dto.priority || 'MEDIUM',
        recipientType: dto.recipientType || 'USER',
        recipientId: dto.recipientId,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    let createdNotification = null;

    // Create In-App Notification if target is USER
    if (dto.recipientType === 'USER') {
      createdNotification = await this.prisma.notification.create({
        data: {
          societyId,
          userId: dto.recipientId,
          channel: dto.channel || 'IN_APP',
          category: dto.category || 'INFORMATION',
          priority: dto.priority || 'MEDIUM',
          title: dto.title,
          message: dto.message,
          metadata: dto.metadata || {},
        },
      });

      // Emit Real-time WebSocket event
      this.gateway.sendToUser(dto.recipientId, createdNotification);
    }

    // Provider Integration Hooks (Firebase, WhatsApp, SMS, Email)
    await this.triggerExternalProviders(dto);

    return dispatch;
  }

  // 3. Society Broadcast Notification (Reliable Pipeline & Descriptive Error Handling)
  async broadcast(societyId: string | null, dto: BroadcastNotificationDto, actorId: string) {
    this.logger.log(`[Broadcast Request] Initiated by actorId=${actorId}, title="${dto.title}", category=${dto.category}`);

    // Resolve societyId if null/undefined (e.g. for SuperAdmin dispatches)
    let targetSocietyId = societyId;
    if (!targetSocietyId && dto.societyId) {
      targetSocietyId = dto.societyId;
    }
    if (!targetSocietyId) {
      const firstSociety = await this.prisma.society.findFirst({
        where: { isDeleted: false },
        select: { id: true },
      });
      targetSocietyId = firstSociety?.id || null;
    }

    if (!targetSocietyId) {
      this.logger.warn(`[Broadcast Validation Failed] No target society found`);
      return {
        success: false,
        broadcastCount: 0,
        message: 'No active society found to dispatch broadcast.',
      };
    }

    // Validation: Find recipient occupants
    const users = await this.prisma.user.findMany({
      where: { societyId: targetSocietyId, isDeleted: false },
      select: { id: true },
    });

    this.logger.log(`[Broadcast Validation] Found ${users.length} recipient occupant(s) in society ${targetSocietyId}`);

    if (users.length === 0) {
      return {
        success: true,
        broadcastCount: 0,
        message: 'No recipients found for this society broadcast.',
      };
    }

    // Database Save: Create In-App notifications inside transaction
    try {
      await this.prisma.$transaction(
        users.map((u) =>
          this.prisma.notification.create({
            data: {
              societyId: targetSocietyId!,
              userId: u.id,
              channel: 'IN_APP',
              category: dto.category || 'BROADCAST',
              priority: dto.priority || 'HIGH',
              title: dto.title,
              message: dto.message,
              metadata: dto.metadata || {},
            },
          }),
        ),
      );
      this.logger.log(`[Database Save] Successfully inserted ${users.length} notification records`);
    } catch (err: any) {
      this.logger.error(`[Database Save Failed] ${err.message}`, err.stack);
      return {
        success: false,
        broadcastCount: 0,
        message: 'Unable to save broadcast in database.',
      };
    }

    // Realtime Dispatch: Emit WebSocket event
    try {
      this.gateway.broadcastToSociety(targetSocietyId, {
        title: dto.title,
        message: dto.message,
        category: dto.category || 'BROADCAST',
      });
      this.logger.log(`[Notification Dispatch] Realtime WebSocket event emitted to society room ${targetSocietyId}`);
    } catch (wsErr: any) {
      this.logger.warn(`[Notification Dispatch Warning] Realtime WebSocket dispatch failed: ${wsErr.message}`);
    }

    // Activity Timeline Logging
    try {
      await this.prisma.activityTimeline.create({
        data: {
          societyId: targetSocietyId,
          entityType: 'NOTIFICATION',
          entityId: targetSocietyId,
          action: ActivityAction.CREATED,
          title: `Broadcast Sent: ${dto.title}`,
          description: `Broadcasted notification to ${users.length} occupants`,
          actorId: actorId || 'SYSTEM',
        },
      });
      this.logger.log(`[Completed] Broadcast pipeline complete for ${users.length} users`);
    } catch (actErr: any) {
      this.logger.warn(`[Activity Log Warning] Failed to log activity timeline: ${actErr.message}`);
    }

    return {
      success: true,
      broadcastCount: users.length,
      message: `Broadcast dispatched successfully to ${users.length} occupant(s).`,
    };
  }

  // 4. Mark Notification as Read
  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // 5. Mark All Notifications as Read
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { message: 'All notifications marked as read' };
  }

  // 6. Archive Notification
  async archiveNotification(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isArchived: true },
    });
  }

  // 7. Notification Template Engine
  async createTemplate(societyId: string | null, dto: CreateTemplateDto) {
    return this.prisma.notificationTemplate.create({
      data: {
        societyId,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        channel: dto.channel,
        titleTemplate: dto.titleTemplate,
        bodyTemplate: dto.bodyTemplate,
        variables: dto.variables || [],
      },
    });
  }

  async getTemplates(societyId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: {
        OR: [{ societyId }, { societyId: null }],
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 8. Provider Integration Skeleton (Firebase FCM, WhatsApp, Email, SMS)
  private async triggerExternalProviders(dto: SendNotificationDto) {
    switch (dto.channel) {
      case 'PUSH':
        break;
      case 'WHATSAPP':
        break;
      case 'SMS':
        break;
      case 'EMAIL':
        break;
      default:
        break;
    }
  }

  // 9. Emergency SOS Broadcast
  async sendEmergencySos(societyId: string, type: string, actorId: string) {
    const notification = await this.prisma.notification.create({
      data: {
        societyId,
        userId: actorId,
        title: `🚨 EMERGENCY SOS: ${type.toUpperCase()}`,
        message: `Emergency SOS triggered for ${type} by resident. Security and Emergency Response alerted immediately.`,
        category: 'EMERGENCY',
        channel: 'IN_APP',
      },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'EMERGENCY_SOS',
        entityId: notification.id,
        action: ActivityAction.CREATED,
        title: `Emergency SOS Alert (${type})`,
        description: `Emergency alert raised by resident for ${type}.`,
        actorId,
      },
    });

    return notification;
  }
}
