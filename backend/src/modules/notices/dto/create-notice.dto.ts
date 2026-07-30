import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { NoticeCategory, NoticePriority, NoticeTargetType } from '@prisma/client';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(NoticeCategory)
  category: NoticeCategory;

  @IsEnum(NoticePriority)
  @IsOptional()
  priority?: NoticePriority;

  @IsDateString()
  @IsOptional()
  publishDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresAcknowledgement?: boolean;

  @IsEnum(NoticeTargetType)
  @IsOptional()
  targetType?: NoticeTargetType;
}
