import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ElectionsService } from './elections.service';
import { ElectionResultsService } from './election-results.service';
import { ElectionAnalyticsService } from './election-analytics.service';
import { ElectionCertificatesService } from './election-certificates.service';
import { CommitteeService } from './committee.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { NominateCandidateDto } from './dto/nominate-candidate.dto';
import { CastElectionVoteDto } from './dto/cast-election-vote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Election & Committee Management Engine')
@ApiBearerAuth()
@Audit()
@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElectionsController {
  constructor(
    private readonly electionsService: ElectionsService,
    private readonly resultsService: ElectionResultsService,
    private readonly analyticsService: ElectionAnalyticsService,
    private readonly certificatesService: ElectionCertificatesService,
    private readonly committeeService: CommitteeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Election' })
  async create(@CurrentTenant() societyId: string, @Body() dto: CreateElectionDto, @ActiveUser('sub') actorId: string) {
    return this.electionsService.createElection(societyId, dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List Elections' })
  async findAll(@CurrentTenant() societyId: string, @Query('status') status?: string) {
    return this.electionsService.findAll(societyId, status);
  }

  @Get('super-admin/benchmarks')
  @ApiOperation({ summary: 'Cross-Society Election Engagement Benchmarks' })
  async getSuperAdminBenchmarks() {
    return this.analyticsService.getSuperAdminBenchmarks();
  }

  @Get('committees/active')
  @ApiOperation({ summary: 'Get Active Committee' })
  async getActiveCommittee(@CurrentTenant() societyId: string) {
    return this.committeeService.getActiveCommittee(societyId);
  }

  @Get('committees/past')
  @ApiOperation({ summary: 'Get Past Committees' })
  async getPastCommittees(@CurrentTenant() societyId: string) {
    return this.committeeService.getPastCommittees(societyId);
  }

  @Get('committees/tenure-check')
  @ApiOperation({ summary: 'Check Committee Tenure Expiry' })
  async checkTenureExpiry(@CurrentTenant() societyId: string) {
    return this.committeeService.checkTenureExpiry(societyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Election Details' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.electionsService.findOne(societyId, id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Advance Election Lifecycle Status' })
  async updateStatus(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Body('status') status: string, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.updateLifecycleStatus(societyId, id, status, actorId);
  }

  @Post(':id/nominate')
  @ApiOperation({ summary: 'Submit Candidate Nomination' })
  async nominate(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Body() dto: NominateCandidateDto, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.nominateCandidate(societyId, id, dto, actorId);
  }

  @Put(':id/nominations/:nid/approve')
  @ApiOperation({ summary: 'Approve Candidate Nomination' })
  async approveNomination(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Param('nid') nid: string, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.updateCandidateStatus(societyId, id, nid, 'APPROVED', actorId);
  }

  @Put(':id/nominations/:nid/reject')
  @ApiOperation({ summary: 'Reject Candidate Nomination' })
  async rejectNomination(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Param('nid') nid: string, @Body('reason') reason: string, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.updateCandidateStatus(societyId, id, nid, 'DISQUALIFIED', actorId, reason);
  }

  @Put(':id/nominations/:nid/withdraw')
  @ApiOperation({ summary: 'Withdraw Candidate Nomination' })
  async withdrawNomination(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Param('nid') nid: string, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.updateCandidateStatus(societyId, id, nid, 'WITHDRAWN', actorId);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Cast Election Vote' })
  async castVote(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Body() dto: CastElectionVoteDto, @ActiveUser('sub') actorId: string,
  ) {
    return this.electionsService.castVote(societyId, id, dto, actorId);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get Election Results' })
  async getResults(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.resultsService.getResults(societyId, id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get Election Turnout Analytics' })
  async getAnalytics(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.analyticsService.getElectionAnalytics(societyId, id);
  }

  @Get(':id/certificates/:type')
  @ApiOperation({ summary: 'Generate Election Certificate' })
  async getCertificate(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Param('type') type: string,
  ) {
    return this.certificatesService.generateCertificate(societyId, id, type);
  }

  @Post(':id/form-committee')
  @ApiOperation({ summary: 'Form Committee from Election Winners' })
  async formCommittee(
    @CurrentTenant() societyId: string, @Param('id') id: string,
    @Body('winners') winners: any[],
  ) {
    return this.committeeService.formCommitteeFromElection(societyId, id, winners);
  }
}
