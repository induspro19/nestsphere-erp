import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VisitorTypeCategory } from '@prisma/client';

export class CreateVisitorPassDto {
  @IsEnum(VisitorTypeCategory)
  @IsNotEmpty({ message: 'Visitor type is required' })
  visitorType: VisitorTypeCategory; // GUEST, RELATIVE, VENDOR, COURIER, FOOD_DELIVERY, CAB_DRIVER, POLICE, AMBULANCE, etc.

  @IsString()
  @IsNotEmpty({ message: 'Visitor name is required' })
  visitorName: string;

  @IsString()
  @IsNotEmpty({ message: 'Visitor phone number is required' })
  visitorPhone: string;

  @IsString()
  @IsOptional()
  visitorEmail?: string;

  @IsString()
  @IsOptional()
  hostPersonId?: string; // Host Resident/User

  @IsString()
  @IsOptional()
  hostUnitId?: string; // Host Flat/Unit

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsDateString()
  @IsOptional()
  expectedArrival?: string;

  @IsDateString()
  @IsOptional()
  expectedExit?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  idProofUrl?: string;

  @IsString()
  @IsOptional()
  passType?: string = 'INSTANT'; // PRE_APPROVED, INSTANT, SCHEDULED, RECURRING
}
