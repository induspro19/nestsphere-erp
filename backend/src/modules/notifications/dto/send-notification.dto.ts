import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannel, NotificationCategory, NotificationPriority } from '@prisma/client';

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel = NotificationChannel.IN_APP;

  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory = NotificationCategory.INFORMATION;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority = NotificationPriority.MEDIUM;

  @IsString()
  @IsNotEmpty({ message: 'Recipient ID is required' })
  recipientId: string; // User ID or Role Name

  @IsString()
  @IsOptional()
  recipientType?: string = 'USER'; // USER, ROLE, SOCIETY_BROADCAST

  @IsString()
  @IsOptional()
  templateCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
