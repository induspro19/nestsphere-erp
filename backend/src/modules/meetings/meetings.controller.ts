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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { MeetingQueryDto } from './dto/meeting-query.dto';

@ApiTags('Meetings Engine')
@ApiBearerAuth()
@ApiHeader({ name: 'x-society-id', description: 'Active Society Tenant ID', required: true })
@UseGuards(JwtAuthGuard)
@Controller('api/v1/meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Executive Dashboard KPIs for Meetings Engine' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.meetingsService.getMetrics(societyId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get All Meeting Templates' })
  async getTemplates(@CurrentTenant() societyId: string) {
    return this.meetingsService.getTemplates(societyId);
  }

  @Post('templates')
  @Audit()
  @ApiOperation({ summary: 'Create Reusable Meeting Template' })
  async createTemplate(@CurrentTenant() societyId: string, @Body() dto: CreateTemplateDto) {
    return this.meetingsService.createTemplate(societyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search & Filter Meetings with Pagination' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: MeetingQueryDto) {
    return this.meetingsService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Meeting Profile (Agendas, Attendance, Resolutions, Action Items)' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.meetingsService.findOne(societyId, id);
  }

  @Post()
  @Audit()
  @ApiOperation({ summary: 'Create New Meeting' })
  async create(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateMeetingDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.meetingsService.create(societyId, dto, actorId);
  }

  @Put(':id')
  @Audit()
  @ApiOperation({ summary: 'Update Meeting Details or Status' })
  async update(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.meetingsService.update(societyId, id, dto, actorId);
  }

  @Delete(':id')
  @Audit()
  @ApiOperation({ summary: 'Soft Delete Meeting' })
  async remove(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.meetingsService.remove(societyId, id, actorId);
  }

  @Post(':id/agenda')
  @Audit()
  @ApiOperation({ summary: 'Add Agenda Item to Meeting' })
  async addAgenda(
    @CurrentTenant() societyId: string,
    @Param('id') meetingId: string,
    @Body() dto: CreateAgendaDto,
  ) {
    return this.meetingsService.addAgenda(societyId, meetingId, dto);
  }

  @Post(':id/attendance')
  @Audit()
  @ApiOperation({ summary: 'Mark Participant Invitation or Attendance' })
  async updateParticipant(
    @CurrentTenant() societyId: string,
    @Param('id') meetingId: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.meetingsService.updateParticipant(societyId, meetingId, dto);
  }

  @Post(':id/resolution')
  @Audit()
  @ApiOperation({ summary: 'Create Meeting Resolution' })
  async createResolution(
    @CurrentTenant() societyId: string,
    @Param('id') meetingId: string,
    @Body() dto: CreateResolutionDto,
  ) {
    return this.meetingsService.createResolution(societyId, meetingId, dto);
  }

  @Post(':id/action-item')
  @Audit()
  @ApiOperation({ summary: 'Create Meeting Action Item Task' })
  async createActionItem(
    @CurrentTenant() societyId: string,
    @Param('id') meetingId: string,
    @Body() dto: CreateActionItemDto,
  ) {
    return this.meetingsService.createActionItem(societyId, meetingId, dto);
  }

  @Post(':id/notice')
  @Audit()
  @ApiOperation({ summary: 'Publish Official Meeting Notice (Linked to Document Engine)' })
  async publishNotice(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('noticeDocumentId') noticeDocumentId: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.meetingsService.publishNotice(societyId, id, noticeDocumentId, actorId);
  }

  @Get(':id/export-attendance')
  @ApiOperation({ summary: 'Export Meeting Attendance Report' })
  async exportAttendance(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.meetingsService.exportAttendance(societyId, id);
  }

  @Get(':id/export-minutes')
  @ApiOperation({ summary: 'Export Minutes of Meeting (MoM) Report' })
  async exportMinutes(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.meetingsService.exportMinutes(societyId, id);
  }

  @Get('dashboard-widgets')
  @ApiOperation({ summary: 'Get Meeting KPIs for Analytics & Dashboard Engine Integration' })
  async getDashboardWidgets(@CurrentTenant() societyId: string) {
    return this.meetingsService.getDashboardWidgets(societyId);
  }
}
