import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowApprovalType, WorkflowAssignmentType, RoleType } from '@prisma/client';

export class WorkflowTemplateStepDto {
  @IsNumber()
  @IsNotEmpty()
  stepNumber: number;

  @IsString()
  @IsNotEmpty()
  stepName: string;

  @IsEnum(WorkflowAssignmentType)
  @IsOptional()
  assignmentType?: WorkflowAssignmentType = WorkflowAssignmentType.ROLE;

  @IsEnum(RoleType)
  @IsOptional()
  assigneeRole?: RoleType;

  @IsString()
  @IsOptional()
  assigneeUserId?: string;

  @IsBoolean()
  @IsOptional()
  requireDigitalSignature?: boolean = false;
}

export class CreateWorkflowTemplateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  entityType: string; // MOVE_IN, MOVE_OUT, VENDOR, STAFF, AMENITY, BILLING, EXPENSE, NOC, COMPLAINT, VISITOR

  @IsEnum(WorkflowApprovalType)
  @IsOptional()
  approvalType?: WorkflowApprovalType = WorkflowApprovalType.SEQUENTIAL;

  @IsNumber()
  @IsOptional()
  slaHours?: number = 24;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowTemplateStepDto)
  steps: WorkflowTemplateStepDto[];
}
