import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { AttendanceRole, InvitationStatus, AttendanceStatus } from '@prisma/client';

export class UpdateParticipantDto {
  @IsString()
  @IsNotEmpty()
  personId: string;

  @IsEnum(AttendanceRole)
  @IsOptional()
  role?: AttendanceRole;

  @IsEnum(InvitationStatus)
  @IsOptional()
  invitationStatus?: InvitationStatus;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  attendanceStatus?: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}
