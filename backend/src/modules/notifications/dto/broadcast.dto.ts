import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationCategory, NotificationPriority } from '@prisma/client';

export class BroadcastNotificationDto {
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory = NotificationCategory.BROADCAST;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority = NotificationPriority.HIGH;

  @IsString()
  @IsNotEmpty({ message: 'Broadcast title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Broadcast message is required' })
  message: string;

  @IsString()
  @IsOptional()
  targetRole?: string; // Optional filter to target e.g. RESIDENT or TENANT only

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
