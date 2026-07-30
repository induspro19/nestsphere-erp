import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsInt, IsDateString, Min } from 'class-validator';
import { MeetingType, MeetingMode, RecurrenceType } from '@prisma/client';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(MeetingType)
  meetingType: MeetingType;

  @IsEnum(MeetingMode)
  @IsOptional()
  meetingMode?: MeetingMode;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  meetingDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  meetingPlatform?: string;

  @IsString()
  @IsOptional()
  meetingPassword?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrenceType?: RecurrenceType;

  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @IsString()
  @IsOptional()
  chairPersonId?: string;

  @IsString()
  @IsOptional()
  secretaryId?: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  requiredQuorum?: number;
}
