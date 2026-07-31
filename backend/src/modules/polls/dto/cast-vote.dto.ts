import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  choiceId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  proxyPersonId?: string;

  @IsString()
  @IsOptional()
  deviceInfo?: string;

  @IsString()
  @IsOptional()
  source?: string = 'APP'; // APP, QR, KIOSK, WEB
}
