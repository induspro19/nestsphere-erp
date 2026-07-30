import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

export class ActionWorkflowDto {
  @IsEnum(ApprovalStatus)
  @IsNotEmpty({ message: 'Action status is required' })
  action: ApprovalStatus; // APPROVED, REJECTED, RETURNED_FOR_CORRECTION, CANCELLED, WITHDRAWN

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  signatureHash?: string; // Digital Signature Hash

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}
