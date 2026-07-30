import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender, PersonRoleCategory, KycStatus, AccountStatus } from '@prisma/client';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  @IsEnum(PersonRoleCategory, { each: true })
  @IsNotEmpty({ message: 'At least one role must be assigned' })
  roles: PersonRoleCategory[]; // OWNER, TENANT, FAMILY_MEMBER, SECURITY_GUARD, MAINTENANCE_STAFF, VENDOR, DRIVER, COOK, HOUSE_MAID, etc.

  @IsArray()
  @IsOptional()
  unitIds?: string[]; // Multiple unit/flat mappings

  @IsString()
  @IsOptional()
  identityType?: string; // Aadhaar, Passport, Driving License, Voter ID

  @IsString()
  @IsOptional()
  identityNumber?: string;

  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;

  @IsArray()
  @IsOptional()
  emergencyContacts?: { name: string; relation: string; phone: string }[];

  @IsBoolean()
  @IsOptional()
  isAttendanceReady?: boolean;

  @IsBoolean()
  @IsOptional()
  isFaceRecognitionReady?: boolean;

  @IsBoolean()
  @IsOptional()
  isMobileAppReady?: boolean;

  @IsBoolean()
  @IsOptional()
  isVisitorReady?: boolean;
}
