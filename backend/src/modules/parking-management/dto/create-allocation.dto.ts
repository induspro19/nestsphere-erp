import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  personId: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  /** PERMANENT | TEMPORARY | GUEST | RESERVED */
  @IsString()
  @IsOptional()
  allocationType?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  depositPaid?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
