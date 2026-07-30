import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccessType, EntryMethod } from '@prisma/client';

export class LogEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Gate ID is required' })
  gateId: string;

  @IsEnum(AccessType)
  @IsNotEmpty({ message: 'Access type is required' })
  accessType: AccessType; // RESIDENT, OWNER, TENANT, FAMILY_MEMBER, COMMITTEE, VENDOR, DELIVERY, COURIER, CAB, GUEST, TEMPORARY_WORKER, SECURITY_STAFF, MAINTENANCE_STAFF, EMERGENCY_SERVICE, POLICE, FIRE_BRIGADE, AMBULANCE, VEHICLE_ENTRY, VISITOR_VEHICLE

  @IsEnum(EntryMethod)
  @IsNotEmpty({ message: 'Entry method is required' })
  entryMethod: EntryMethod; // RFID, QR_CODE, FACE_RECOGNITION, OTP, MANUAL_APPROVAL, REMOTE_APPROVAL, BIOMETRIC, EMERGENCY_OVERRIDE

  @IsString()
  @IsOptional()
  personId?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  qrToken?: string;

  @IsString()
  @IsOptional()
  otpToken?: string;

  @IsString()
  @IsOptional()
  approvalSource?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
