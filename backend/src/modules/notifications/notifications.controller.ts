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
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Communication & Notification Engine')
@ApiBearerAuth()
@Audit()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get User Notification Inbox & Unread Counter' })
  async getUserNotifications(
    @ActiveUser('sub') userId: string,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send Target Notification (In-App, Push, Email, SMS, WhatsApp)' })
  async send(
    @CurrentTenant() societyId: string,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationsService.send(societyId, dto);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast Emergency / Notice Notification to Society Occupants' })
  async broadcast(
    @CurrentTenant() societyId: string,
    @Body() dto: BroadcastNotificationDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.notificationsService.broadcast(societyId, dto, actorId);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark Notification as Read' })
  async markAsRead(@ActiveUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark All User Notifications as Read' })
  async markAllAsRead(@ActiveUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive User Notification' })
  async archiveNotification(@ActiveUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.archiveNotification(userId, id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create Notification Template (Variables & Channels)' })
  async createTemplate(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.notificationsService.createTemplate(societyId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get Active Notification Templates Engine' })
  async getTemplates(@CurrentTenant() societyId: string) {
    return this.notificationsService.getTemplates(societyId);
  }

  @Post('sos')
  @Audit()
  @ApiOperation({ summary: 'Emergency SOS Broadcast Alert' })
  async sendEmergencySos(
    @CurrentTenant() societyId: string,
    @Body('type') type: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.notificationsService.sendEmergencySos(societyId, type || 'SECURITY', actorId);
  }
}
