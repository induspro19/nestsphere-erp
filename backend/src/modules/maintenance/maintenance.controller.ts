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
import { MaintenanceService } from './maintenance.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Maintenance & Work Order Management')
@ApiBearerAuth()
@Audit()
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get Maintenance MTTR, Downtime & Labour/Material Cost Metrics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.maintenanceService.getMetrics(societyId);
  }

  @Get()
  @ApiOperation({ summary: 'Query All Work Orders (Preventive, Corrective, Inspection)' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryMaintenanceDto) {
    return this.maintenanceService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Work Order Details, Asset Link & Service Checklist' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.maintenanceService.findOne(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule Maintenance Work Order (Auto WO-00001 Generator)' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateWorkOrderDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.maintenanceService.create(societyId, dto, actorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Work Order Status, Downtime Hours & Labour/Material Costs' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.maintenanceService.update(societyId, id, dto, actorId);
  }
}
