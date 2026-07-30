import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { MeetingType } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MeetingType)
  meetingType: MeetingType;

  @IsOptional()
  defaultAgenda?: any;

  @IsInt()
  @Min(15)
  @IsOptional()
  estimatedDuration?: number;
}
