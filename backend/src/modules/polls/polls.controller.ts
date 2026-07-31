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
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { PollsService } from './polls.service';
import { PollResultsService } from './poll-results.service';
import { PollAnalyticsService } from './poll-analytics.service';
import { PollExportService } from './poll-export.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { QueryPollsDto } from './dto/query-polls.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Poll, Voting & Governance Engine')
@ApiBearerAuth()
@Audit()
@Controller('polls')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly resultsService: PollResultsService,
    private readonly analyticsService: PollAnalyticsService,
    private readonly exportService: PollExportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Poll or Resolution' })
  async createPoll(
    @CurrentTenant() societyId: string,
    @Body() dto: CreatePollDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.pollsService.createPoll(societyId, dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get Polls Feed' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryPollsDto) {
    return this.pollsService.findAll(societyId, query);
  }

  @Get('super-admin/benchmarks')
  @ApiOperation({ summary: 'Get Multi-Society Poll & Voting Engagement Benchmarks' })
  async getSuperAdminPollBenchmarks() {
    return this.analyticsService.getSuperAdminPollBenchmarks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Single Poll Details & Eligibility' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.pollsService.findOne(societyId, id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update Lifecycle Status (DRAFT, SCHEDULED, ACTIVE, PAUSED, CLOSED, RESULT_PUBLISHED, ARCHIVED)' })
  async updateStatus(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.pollsService.updateLifecycleStatus(societyId, id, status, actorId);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Cast Vote in Poll / Resolution' })
  async castVote(
    @CurrentTenant() societyId: string,
    @Param('id') pollId: string,
    @Body() dto: CastVoteDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.pollsService.castVote(societyId, pollId, dto, actorId);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get Poll Results & Quorum Verification' })
  async getResults(@CurrentTenant() societyId: string, @Param('id') pollId: string) {
    return this.resultsService.getPollResults(societyId, pollId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get Detailed Poll Turnout Analytics' })
  async getAnalytics(@CurrentTenant() societyId: string, @Param('id') pollId: string) {
    return this.analyticsService.getPollAnalytics(societyId, pollId);
  }

  @Get(':id/export-csv')
  @ApiOperation({ summary: 'Export Poll Results as CSV' })
  async exportCsv(
    @CurrentTenant() societyId: string,
    @Param('id') pollId: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.generateResultCsv(societyId, pollId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=poll-results-${pollId}.csv`);
    return res.send(csv);
  }
}
