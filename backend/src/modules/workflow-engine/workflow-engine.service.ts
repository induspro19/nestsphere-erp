import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkflowTemplateDto } from './dto/create-template.dto';
import { StartWorkflowDto } from './dto/start-workflow.dto';
import { ActionWorkflowDto } from './dto/action-workflow.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityAction, RoleType } from '@prisma/client';

@Injectable()
export class WorkflowEngineService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 1. Create Workflow Template
  async createTemplate(societyId: string | null, dto: CreateWorkflowTemplateDto) {
    return this.prisma.workflowTemplate.create({
      data: {
        societyId,
        code: dto.code,
        name: dto.name,
        entityType: dto.entityType,
        approvalType: dto.approvalType || 'SEQUENTIAL',
        slaHours: dto.slaHours || 24,
        steps: {
          create: dto.steps.map((s) => ({
            stepNumber: s.stepNumber,
            stepName: s.stepName,
            assignmentType: s.assignmentType || 'ROLE',
            assigneeRole: s.assigneeRole || 'COMMITTEE',
            assigneeUserId: s.assigneeUserId || null,
            requireDigitalSignature: s.requireDigitalSignature || false,
          })),
        },
      },
      include: { steps: true },
    });
  }

  async getTemplates(societyId: string) {
    return this.prisma.workflowTemplate.findMany({
      where: {
        OR: [{ societyId }, { societyId: null }],
        isActive: true,
      },
      include: { steps: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Start Workflow Instance for Entity
  async startWorkflow(societyId: string, dto: StartWorkflowDto, actorId: string) {
    // Find matching template or fallback to global template
    let template = await this.prisma.workflowTemplate.findFirst({
      where: {
        code: dto.templateCode || undefined,
        entityType: dto.entityType,
        OR: [{ societyId }, { societyId: null }],
      },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    // Default template steps if no template defined
    const defaultSteps = [
      { stepNumber: 1, stepName: 'Level 1 Verification', roleCode: RoleType.COMMITTEE },
      { stepNumber: 2, stepName: 'Final Approval', roleCode: RoleType.SOCIETY_ADMIN },
    ];

    const slaHours = template ? template.slaHours : 24;
    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const instance = await this.prisma.workflowInstance.create({
      data: {
        societyId,
        templateId: template ? template.id : null,
        entityType: dto.entityType,
        entityId: dto.entityId,
        title: dto.title,
        notes: dto.notes,
        status: 'PENDING',
        currentStepNumber: 1,
        slaDueDate,
        createdBy: actorId,
        steps: {
          create: template
            ? template.steps.map((s) => ({
                stepNumber: s.stepNumber,
                stepName: s.stepName,
                roleCode: s.assigneeRole || RoleType.COMMITTEE,
                status: 'PENDING',
              }))
            : defaultSteps.map((s) => ({
                stepNumber: s.stepNumber,
                stepName: s.stepName,
                roleCode: s.roleCode,
                status: 'PENDING',
              })),
        },
      },
      include: { steps: true },
    });

    // Log Activity
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'WORKFLOW',
        entityId: instance.id,
        action: ActivityAction.CREATED,
        title: `Workflow Started: ${dto.title}`,
        description: `Approval process initiated for ${dto.entityType}`,
        actorId,
      },
    });

    return instance;
  }

  // 3. Process Approval Action (Approve, Reject, Return for Correction, Cancel, Withdraw)
  async processAction(societyId: string, instanceId: string, dto: ActionWorkflowDto, actorId: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { id: instanceId, societyId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    if (['APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'].includes(instance.status)) {
      throw new BadRequestException(`Workflow is already in final state: ${instance.status}`);
    }

    const currentStep = instance.steps.find((s) => s.stepNumber === instance.currentStepNumber);
    if (!currentStep) {
      throw new BadRequestException('Current approval step not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update Step Instance
      await tx.workflowStepInstance.update({
        where: { id: currentStep.id },
        data: {
          status: dto.action,
          approverId: actorId,
          comments: dto.comments,
          signatureHash: dto.signatureHash,
          actionAt: new Date(),
        },
      });

      // Add Comment if provided
      if (dto.comments) {
        await tx.workflowComment.create({
          data: {
            instanceId,
            actorId,
            comment: dto.comments,
            attachmentUrl: dto.attachmentUrl,
          },
        });
      }

      // Action Handlers
      if (dto.action === 'APPROVED') {
        const nextStep = instance.steps.find((s) => s.stepNumber === instance.currentStepNumber + 1);
        if (nextStep) {
          // Advance to Next Step Level
          await tx.workflowInstance.update({
            where: { id: instanceId },
            data: {
              currentStepNumber: instance.currentStepNumber + 1,
              status: 'IN_REVIEW',
            },
          });
        } else {
          // Final Approval Reached!
          await tx.workflowInstance.update({
            where: { id: instanceId },
            data: {
              status: 'APPROVED',
              signatureHash: dto.signatureHash,
            },
          });
        }
      } else {
        // REJECTED, RETURNED_FOR_CORRECTION, CANCELLED, WITHDRAWN
        await tx.workflowInstance.update({
          where: { id: instanceId },
          data: { status: dto.action },
        });
      }

      // Log Activity Timeline
      await tx.activityTimeline.create({
        data: {
          societyId,
          entityType: 'WORKFLOW',
          entityId: instanceId,
          action: dto.action === 'APPROVED' ? ActivityAction.APPROVED : ActivityAction.REJECTED,
          title: `Workflow Action: ${dto.action}`,
          description: `Action ${dto.action} processed on step ${currentStep.stepName}`,
          actorId,
        },
      });
    });

    return this.getWorkflowInstance(societyId, instanceId);
  }

  // 4. Get My Pending Approvals
  async getPendingApprovals(societyId: string, userRoles: string[], userId: string) {
    const pendingInstances = await this.prisma.workflowInstance.findMany({
      where: {
        societyId,
        status: { in: ['PENDING', 'IN_REVIEW'] },
      },
      include: {
        steps: true,
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter instances where current step role matches user's assigned roles
    return pendingInstances.filter((instance) => {
      const currentStep = instance.steps.find((s) => s.stepNumber === instance.currentStepNumber);
      if (!currentStep) return false;
      return userRoles.includes(currentStep.roleCode);
    });
  }

  // 5. Get Detailed Workflow Instance with Timeline & Comments
  async getWorkflowInstance(societyId: string, instanceId: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { id: instanceId, societyId },
      include: {
        template: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        comments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    const timeline = await this.prisma.activityTimeline.findMany({
      where: { societyId, entityType: 'WORKFLOW', entityId: instanceId },
      orderBy: { createdAt: 'desc' },
    });

    return { ...instance, timeline };
  }

  // 6. Add Workflow Comment
  async addComment(societyId: string, instanceId: string, actorId: string, comment: string, attachmentUrl?: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { id: instanceId, societyId },
    });

    if (!instance) throw new NotFoundException('Workflow not found');

    return this.prisma.workflowComment.create({
      data: {
        instanceId,
        actorId,
        comment,
        attachmentUrl,
      },
    });
  }

  // 7. Query All Workflows & Analytics
  async queryWorkflows(societyId: string, query: QueryWorkflowDto) {
    const { search, entityType, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (entityType) where.entityType = entityType;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { steps: true },
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
