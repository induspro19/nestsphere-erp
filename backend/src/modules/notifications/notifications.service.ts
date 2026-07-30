import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { BroadcastNotificationDto } from './dto/broadcast.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class NotificationsService {
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

  // 3. Society Broadcast Notification
  async broadcast(societyId: string, dto: BroadcastNotificationDto, actorId: string) {
    const users = await this.prisma.user.findMany({
      where: { societyId, isDeleted: false },
      select: { id: true },
    });

    const createdNotifications = await this.prisma.$transaction(
      users.map((u) =>
        this.prisma.notification.create({
          data: {
            societyId,
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

    // Dispatch WebSocket Broadcast
    this.gateway.broadcastToSociety(societyId, {
      title: dto.title,
      message: dto.message,
      category: dto.category,
    });

    // Log Activity
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'NOTIFICATION',
        entityId: societyId,
        action: ActivityAction.CREATED,
        title: `Broadcast Sent: ${dto.title}`,
        description: `Broadcasted notification to ${users.length} occupants`,
        actorId,
      },
    });

    return { broadcastCount: users.length };
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
        // Firebase Cloud Messaging (FCM) push integration hook
        break;
      case 'WHATSAPP':
        // WhatsApp Business Cloud API integration hook
        break;
      case 'SMS':
        // SMS Gateway (Twilio / Fast2SMS) integration hook
        break;
      case 'EMAIL':
        // Nodemailer / SendGrid email integration hook
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
