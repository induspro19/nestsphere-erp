import { PartialType } from '@nestjs/swagger';
import { CreateMeetingDto } from './create-meeting.dto';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
  @IsEnum(MeetingStatus)
  @IsOptional()
  meetingStatus?: MeetingStatus;

  @IsBoolean()
  @IsOptional()
  minutesPrepared?: boolean;

  @IsBoolean()
  @IsOptional()
  minutesApproved?: boolean;

  @IsString()
  @IsOptional()
  minutesNotes?: string;
}
