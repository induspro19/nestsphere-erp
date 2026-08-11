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
import { VisitorManagementService } from './visitor-management.service';
import { CreateVisitorPassDto } from './dto/create-visitor-pass.dto';
import { CheckInVisitorDto } from './dto/check-in-visitor.dto';
import { QueryVisitorPassDto } from './dto/query-visitor-pass.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

import { Logger } from '@nestjs/common';

@ApiTags('Enterprise Visitor Management Module')
@ApiBearerAuth()
@Audit()
@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorManagementController {
  private readonly logger = new Logger(VisitorManagementController.name);

  constructor(private visitorService: VisitorManagementService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get Visitor Analytics, Daily/Monthly Metrics & Frequent Visitors' })
  async getAnalytics(@CurrentTenant() societyId: string) {
    this.logger.log(`GET /visitors/analytics - SocietyID: ${societyId}`);
    return this.visitorService.getAnalytics(societyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get Paginated Visitor Passes & Log History' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryVisitorPassDto) {
    this.logger.log(`GET /visitors - SocietyID: ${societyId}, Query: ${JSON.stringify(query)}`);
    return this.visitorService.findAll(societyId, query);
  }

  @Post('pass')
  @ApiOperation({ summary: 'Create / Pre-Approve Visitor Pass (Generates Pass Code & OTP)' })
  async createPass(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateVisitorPassDto,
    @ActiveUser('sub') actorId: string,
  ) {
    this.logger.log(`POST /visitors/pass - SocietyID: ${societyId}, ActorID: ${actorId}, Payload: ${JSON.stringify(dto)}`);
    return this.visitorService.createPass(societyId, dto, actorId);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gate Check-In Visitor via OTP or QR Pass Token' })
  async checkIn(
    @CurrentTenant() societyId: string,
    @Body() dto: CheckInVisitorDto,
    @ActiveUser('sub') guardId: string,
  ) {
    this.logger.log(`POST /visitors/check-in - SocietyID: ${societyId}, GuardID: ${guardId}, Payload: ${JSON.stringify(dto)}`);
    return this.visitorService.checkIn(societyId, dto, guardId);
  }

  @Post(':id/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gate Check-Out Visitor' })
  async checkOut(
    @CurrentTenant() societyId: string,
    @Param('id') passId: string,
    @ActiveUser('sub') guardId: string,
  ) {
    this.logger.log(`POST /visitors/${passId}/check-out - SocietyID: ${societyId}, GuardID: ${guardId}`);
    return this.visitorService.checkOut(societyId, passId, guardId);
  }
}
