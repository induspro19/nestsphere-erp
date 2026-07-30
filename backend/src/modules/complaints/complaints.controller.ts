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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Complaint & Helpdesk Management')
@ApiBearerAuth()
@Audit()
@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get Helpdesk SLA, Open, Resolved & Cost Metrics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.complaintsService.getMetrics(societyId);
  }

  @Get()
  @ApiOperation({ summary: 'Query All Complaint Tickets with Search & Category Filters' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryComplaintsDto) {
    return this.complaintsService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Complaint Details, SLA Due Date & Maintenance Technician' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.complaintsService.findOne(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create New Complaint Ticket (Auto CMP-00001 Generator)' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateComplaintDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.complaintsService.create(societyId, dto, actorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Ticket Status, Assign Technician/Vendor, Cost & Root Cause Analysis' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.complaintsService.update(societyId, id, dto, actorId);
  }
}
