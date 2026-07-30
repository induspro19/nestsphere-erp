import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationChannel, NotificationCategory } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(NotificationCategory)
  @IsNotEmpty()
  category: NotificationCategory;

  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @IsString()
  @IsNotEmpty()
  titleTemplate: string;

  @IsString()
  @IsNotEmpty()
  bodyTemplate: string;

  @IsArray()
  @IsOptional()
  variables?: string[];
}
