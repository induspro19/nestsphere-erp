import { Audit } from '../../common/decorators/audit.decorator';
import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyManagementService } from './property-management.service';
import { UpdatePropertyConfigDto } from './dto/update-property-config.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Property Management Engine')
@ApiBearerAuth()
@Audit()
@Controller('property-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyManagementController {
  constructor(private propertyService: PropertyManagementService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get Property Configuration' })
  async getPropertyConfig(@CurrentTenant() societyId: string) {
    return this.propertyService.getPropertyConfig(societyId);
  }

  @Put('config')
  @RequireRoles(RoleType.SUPER_ADMIN, RoleType.SOCIETY_ADMIN)
  @ApiOperation({ summary: 'Update Property Configuration (Wings, Floors, Labels, Numbering)' })
  async updatePropertyConfig(
    @CurrentTenant() societyId: string,
    @Body() dto: UpdatePropertyConfigDto,
  ) {
    return this.propertyService.updatePropertyConfig(societyId, dto);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get Full Property Hierarchy (Blocks/Towers -> Wings -> Floors -> Units)' })
  async getPropertyHierarchy(@CurrentTenant() societyId: string) {
    return this.propertyService.getPropertyHierarchy(societyId);
  }

  @Post('blocks')
  @RequireRoles(RoleType.SUPER_ADMIN, RoleType.SOCIETY_ADMIN)
  @ApiOperation({ summary: 'Create Block / Tower / Building' })
  async createBlock(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateBlockDto,
  ) {
    return this.propertyService.createBlock(societyId, dto);
  }

  @Post('units')
  @RequireRoles(RoleType.SUPER_ADMIN, RoleType.SOCIETY_ADMIN)
  @ApiOperation({ summary: 'Create Property Unit (Apartment, Villa, Shop, Office, etc.)' })
  async createUnit(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.propertyService.createUnit(societyId, dto);
  }
}
