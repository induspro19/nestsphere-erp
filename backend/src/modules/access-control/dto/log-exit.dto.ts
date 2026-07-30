import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LogExitDto {
  @IsString()
  @IsNotEmpty({ message: 'Gate ID is required' })
  gateId: string;

  @IsString()
  @IsOptional()
  accessLogId?: string;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsString()
  @IsOptional()
  personId?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
