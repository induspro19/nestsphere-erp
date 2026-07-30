import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { NotificationChannel, NotificationCategory } from '@prisma/client';

export class QueryNotificationDto {
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
