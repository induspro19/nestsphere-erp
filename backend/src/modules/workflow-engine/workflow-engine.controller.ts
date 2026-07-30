import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowTemplateDto } from './dto/create-template.dto';
import { StartWorkflowDto } from './dto/start-workflow.dto';
import { ActionWorkflowDto } from './dto/action-workflow.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Workflow & Approval Engine')
@ApiBearerAuth()
@Audit()
@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowEngineController {
  constructor(private workflowService: WorkflowEngineService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get Pending Approvals Assigned to Current User/Roles' })
  async getPendingApprovals(
    @CurrentTenant() societyId: string,
    @ActiveUser('roles') userRoles: string[],
    @ActiveUser('sub') userId: string,
  ) {
    return this.workflowService.getPendingApprovals(societyId, userRoles || ['COMMITTEE'], userId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Initiate Workflow Approval Instance for Any Module' })
  async startWorkflow(
    @CurrentTenant() societyId: string,
    @Body() dto: StartWorkflowDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.workflowService.startWorkflow(societyId, dto, actorId);
  }

  @Post(':id/action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process Approval Action (Approve, Reject, Return, Cancel, Withdraw)' })
  async processAction(
    @CurrentTenant() societyId: string,
    @Param('id') instanceId: string,
    @Body() dto: ActionWorkflowDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.workflowService.processAction(societyId, instanceId, dto, actorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Workflow Approval Progression, Steps & Comments' })
  async getWorkflowInstance(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.workflowService.getWorkflowInstance(societyId, id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add Comment / Attachment to Workflow Instance' })
  async addComment(
    @CurrentTenant() societyId: string,
    @Param('id') instanceId: string,
    @Body('comment') comment: string,
    @Body('attachmentUrl') attachmentUrl: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.workflowService.addComment(societyId, instanceId, actorId, comment, attachmentUrl);
  }

  @Get()
  @ApiOperation({ summary: 'Query All Workflows, Audit Trail & Analytics' })
  async queryWorkflows(@CurrentTenant() societyId: string, @Query() query: QueryWorkflowDto) {
    return this.workflowService.queryWorkflows(societyId, query);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create Workflow Template with Multi-Level Approvals' })
  async createTemplate(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateWorkflowTemplateDto,
  ) {
    return this.workflowService.createTemplate(societyId, dto);
  }

  @Get('templates/all')
  @ApiOperation({ summary: 'List Active Workflow Templates' })
  async getTemplates(@CurrentTenant() societyId: string) {
    return this.workflowService.getTemplates(societyId);
  }
}
