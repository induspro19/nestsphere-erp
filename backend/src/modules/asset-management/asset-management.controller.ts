import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetManagementService } from './asset-management.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { LogAssetServiceDto } from './dto/log-asset-service.dto';
import { QueryAssetDto } from './dto/query-asset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Asset & Resource Management Engine')
@ApiBearerAuth()
@Audit()
@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetManagementController {
  constructor(private assetService: AssetManagementService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get 24 Asset Categories' })
  async getCategories(@CurrentTenant() societyId: string) {
    return this.assetService.getCategories(societyId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get Asset Portfolio Valuation & Inspection Metrics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.assetService.getMetrics(societyId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export Asset Inventory Registry Dataset' })
  async bulkExport(@CurrentTenant() societyId: string) {
    return this.assetService.bulkExport(societyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get Paginated Asset Inventory (Search, Category & Status Filter)' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryAssetDto) {
    return this.assetService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Asset Profile, Service History & QR Card' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.assetService.findOne(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Register New Asset Profile' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateAssetDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.assetService.create(societyId, dto, actorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Asset Valuation & Maintenance Schedules' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.assetService.update(societyId, id, dto, actorId);
  }

  @Post(':id/log-service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log Asset Inspection / Breakdown / Service Event' })
  async logServiceEvent(
    @CurrentTenant() societyId: string,
    @Param('id') assetId: string,
    @Body() dto: LogAssetServiceDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.assetService.logServiceEvent(societyId, assetId, dto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft Delete Asset Profile' })
  async remove(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.assetService.remove(societyId, id, actorId);
  }
}
