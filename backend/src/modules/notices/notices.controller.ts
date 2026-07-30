import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticeQueryDto } from './dto/notice-query.dto';
import { CreateNoticeTemplateDto } from './dto/create-notice-template.dto';

@ApiTags('Notice Board Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Notice Board Executive Dashboard Metrics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.noticesService.getMetrics(societyId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get Notice Templates' })
  async getTemplates(@CurrentTenant() societyId: string) {
    return this.noticesService.getTemplates(societyId);
  }

  @Post('templates')
  @Audit()
  @ApiOperation({ summary: 'Create Reusable Notice Template' })
  async createTemplate(@CurrentTenant() societyId: string, @Body() dto: CreateNoticeTemplateDto) {
    return this.noticesService.createTemplate(societyId, dto);
  }

  @Get('dashboard-widgets')
  @ApiOperation({ summary: 'Get Notice KPIs for Analytics & Dashboard Engine' })
  async getDashboardWidgets(@CurrentTenant() societyId: string) {
    return this.noticesService.getDashboardWidgets(societyId);
  }

  @Get()
  @ApiOperation({ summary: 'Search & Filter Notices' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: NoticeQueryDto) {
    return this.noticesService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Notice Details' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.noticesService.findOne(societyId, id);
  }

  @Post()
  @Audit()
  @ApiOperation({ summary: 'Create & Publish Notice (NTC-00001)' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateNoticeDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.noticesService.createNotice(societyId, dto, actorId);
  }

  @Put(':id')
  @Audit()
  @ApiOperation({ summary: 'Update Notice Details' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoticeDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.noticesService.updateNotice(societyId, id, dto, actorId);
  }

  @Post(':id/approve')
  @Audit()
  @ApiOperation({ summary: 'Approve Pending Notice' })
  async approveNotice(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.noticesService.approveNotice(societyId, id, actorId);
  }

  @Post(':id/acknowledge')
  @Audit()
  @ApiOperation({ summary: 'Acknowledge Notice Read Status' })
  async acknowledgeNotice(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') personId: string,
  ) {
    return this.noticesService.acknowledgeNotice(societyId, id, personId);
  }

  @Delete(':id')
  @Audit()
  @ApiOperation({ summary: 'Soft Delete Notice' })
  async remove(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.noticesService.removeNotice(societyId, id, actorId);
  }
}
