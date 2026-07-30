import { Audit } from '../../common/decorators/audit.decorator';
import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Application Settings (10 Domains)')
@ApiBearerAuth()
@Audit()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get 10-Domain Society Settings' })
  async getSettings(
    @CurrentTenant() societyId: string,
    @Query('domain') domain?: string,
  ) {
    return this.settingsService.getSettings(societyId, domain);
  }

  @Put()
  @RequireRoles(RoleType.SUPER_ADMIN, RoleType.SOCIETY_ADMIN)
  @ApiOperation({ summary: 'Upsert Society Settings Key-Value' })
  async updateSetting(
    @CurrentTenant() societyId: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.upsertSetting(societyId, dto);
  }
}
