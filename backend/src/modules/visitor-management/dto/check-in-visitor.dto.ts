import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckInVisitorDto {
  @IsString()
  @IsOptional()
  passId?: string;

  @IsString()
  @IsOptional()
  otpCode?: string;

  @IsString()
  @IsOptional()
  qrToken?: string;

  @IsString()
  @IsOptional()
  gateId?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
