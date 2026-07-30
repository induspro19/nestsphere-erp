import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StorageProvider } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty({ message: 'Document title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  category?: string = 'GENERAL'; // KYC, AGREEMENT, MANUAL, INVOICE, BLUEPRINT, NOC, COMPLIANCE

  @IsString()
  @IsOptional()
  entityType?: string; // PERSON, VISITOR, PROPERTY, ASSET, WORKFLOW, COMPLAINT, VENDOR, STAFF, BILLING, INVOICE, PAYMENT, MEETING, SOCIETY

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsNotEmpty({ message: 'MIME type is required' })
  mimeType: string;

  @IsString()
  @IsNotEmpty({ message: 'File extension is required' })
  extension: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Size in bytes is required' })
  sizeBytes: number;

  @IsEnum(StorageProvider)
  @IsOptional()
  storageProvider?: StorageProvider = StorageProvider.LOCAL; // LOCAL, AWS_S3, MINIO, AZURE_BLOB, GOOGLE_CLOUD_STORAGE

  @IsString()
  @IsNotEmpty({ message: 'File URL is required' })
  fileUrl: string;

  @IsString()
  @IsOptional()
  storageKey?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  fileHash?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean = false;

  @IsArray()
  @IsOptional()
  accessRoles?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsDateString()
  @IsOptional()
  renewalReminderDate?: string;

  @IsString()
  @IsOptional()
  workflowInstanceId?: string;
}
