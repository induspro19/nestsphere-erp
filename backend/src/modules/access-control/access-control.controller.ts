import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessControlService } from './access-control.service';
import { LogEntryDto } from './dto/log-entry.dto';
import { LogExitDto } from './dto/log-exit.dto';
import { QueryAccessLogDto } from './dto/query-access-log.dto';
import { CreateAccessRuleDto } from './dto/create-access-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Reusable Access Control Engine')
@ApiBearerAuth()
@Audit()
@Controller('access-control')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessControlController {
  constructor(private accessService: AccessControlService) {}

  @Post('entry')
  @ApiOperation({ summary: 'Log Entry Access Event (RFID, QR, Face, Manual, OTP, Override)' })
  async logEntry(
    @CurrentTenant() societyId: string,
    @Body() dto: LogEntryDto,
    @ActiveUser('sub') guardId: string,
  ) {
    return this.accessService.logEntry(societyId, dto, guardId);
  }

  @Post('exit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log Exit Access Event & Calculate Duration / Overstay' })
  async logExit(
    @CurrentTenant() societyId: string,
    @Body() dto: LogExitDto,
    @ActiveUser('sub') guardId: string,
  ) {
    return this.accessService.logExit(societyId, dto, guardId);
  }

  @Get('live-occupancy')
  @ApiOperation({ summary: 'Get Current Live Inside Count & Occupancy Metrics' })
  async getLiveOccupancy(@CurrentTenant() societyId: string) {
    return this.accessService.getLiveOccupancy(societyId);
  }

  @Get('overstay-alerts')
  @ApiOperation({ summary: 'Get Active Overstay Warnings (>4 Hours)' })
  async getOverstayAlerts(@CurrentTenant() societyId: string) {
    return this.accessService.getOverstayAlerts(societyId);
  }

  @Post('emergency-override')
  @ApiOperation({ summary: 'Emergency Override Access (Police, Fire Brigade, Ambulance)' })
  async emergencyOverride(
    @CurrentTenant() societyId: string,
    @Body('emergencyType') emergencyType: 'POLICE' | 'FIRE_BRIGADE' | 'AMBULANCE' | 'EMERGENCY_SERVICE',
    @Body('remarks') remarks: string,
    @ActiveUser('sub') guardId: string,
  ) {
    return this.accessService.emergencyOverride(societyId, emergencyType, guardId, remarks);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Query Access History Logs & Reports' })
  async getAccessLogs(@CurrentTenant() societyId: string, @Query() query: QueryAccessLogDto) {
    return this.accessService.getAccessLogs(societyId, query);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Add Whitelist or Blacklist Access Rule' })
  async createAccessRule(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateAccessRuleDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.accessService.createAccessRule(societyId, dto, actorId);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List Whitelist and Blacklist Rules' })
  async getAccessRules(@CurrentTenant() societyId: string) {
    return this.accessService.getAccessRules(societyId);
  }
}
