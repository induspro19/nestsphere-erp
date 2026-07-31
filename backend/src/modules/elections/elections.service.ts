import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { NominateCandidateDto } from './dto/nominate-candidate.dto';
import { CastElectionVoteDto } from './dto/cast-election-vote.dto';
import * as crypto from 'crypto';

const ELECTION_LIFECYCLE = [
  'DRAFT', 'PUBLISHED', 'NOMINATION_OPEN', 'SCRUTINY', 'WITHDRAWAL_PERIOD',
  'CAMPAIGN', 'VOTING_OPEN', 'COUNTING', 'RESULT_DECLARED',
  'APPEAL_PERIOD', 'CERTIFIED', 'ARCHIVED',
];

const CANDIDATE_STATES = [
  'DRAFT', 'SUBMITTED', 'DOCUMENT_VERIFICATION', 'ELIGIBILITY_VERIFICATION',
  'APPROVED', 'CAMPAIGN', 'WITHDRAWN', 'DISQUALIFIED',
];

@Injectable()
export class ElectionsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultElectionIfEmpty();
  }

  async createElection(societyId: string, dto: CreateElectionDto, actorId: string) {
    const election = await this.prisma.election.create({
      data: {
        societyId,
        title: dto.title,
        description: dto.description,
        electionType: dto.electionType,
        status: 'DRAFT',
        quorumPercentage: dto.quorumPercentage,
        isSecretBallot: dto.isSecretBallot,
        allowProxy: dto.allowProxy,
        votingRule: dto.votingRule,
        nominationStartDate: dto.nominationStartDate ? new Date(dto.nominationStartDate) : null,
        nominationEndDate: dto.nominationEndDate ? new Date(dto.nominationEndDate) : null,
        scrutinyEndDate: dto.scrutinyEndDate ? new Date(dto.scrutinyEndDate) : null,
        withdrawalEndDate: dto.withdrawalEndDate ? new Date(dto.withdrawalEndDate) : null,
        campaignStartDate: dto.campaignStartDate ? new Date(dto.campaignStartDate) : null,
        campaignEndDate: dto.campaignEndDate ? new Date(dto.campaignEndDate) : null,
        votingStartDate: dto.votingStartDate ? new Date(dto.votingStartDate) : null,
        votingEndDate: dto.votingEndDate ? new Date(dto.votingEndDate) : null,
        resultDate: dto.resultDate ? new Date(dto.resultDate) : null,
        appealEndDate: dto.appealEndDate ? new Date(dto.appealEndDate) : null,
        createdBy: actorId,
        positions: {
          create: dto.positions.map(p => ({
            positionTitle: p.positionTitle,
            seats: p.seats,
            description: p.description,
          })),
        },
      },
      include: { positions: true },
    });

    await this.addAuditLog(election.id, 'ELECTION_CREATED', actorId, 'SOCIETY_ADMIN', `Created election: ${dto.title}`);
    return election;
  }

  async findAll(societyId: string, status?: string) {
    const where: any = { societyId, isDeleted: false };
    if (status && status !== 'ALL') where.status = status;

    return this.prisma.election.findMany({
      where,
      include: { positions: { include: { candidates: true, votes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(societyId: string, electionId: string) {
    const election = await this.prisma.election.findFirst({
      where: { id: electionId, societyId, isDeleted: false },
      include: {
        positions: { include: { candidates: true, votes: true } },
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 50 },
      },
    });
    if (!election) throw new NotFoundException('Election not found');
    return election;
  }

  async updateLifecycleStatus(societyId: string, electionId: string, newStatus: string, actorId: string) {
    const election = await this.findOne(societyId, electionId);
    const currentIndex = ELECTION_LIFECYCLE.indexOf(election.status);
    const newIndex = ELECTION_LIFECYCLE.indexOf(newStatus);

    if (newIndex < 0) throw new BadRequestException(`Invalid status: ${newStatus}`);
    if (newIndex !== currentIndex + 1) {
      throw new BadRequestException(`Cannot transition from ${election.status} to ${newStatus}. Next valid status: ${ELECTION_LIFECYCLE[currentIndex + 1]}`);
    }

    const updated = await this.prisma.election.update({
      where: { id: electionId },
      data: {
        status: newStatus,
        ...(newStatus === 'CERTIFIED' ? { certifiedAt: new Date() } : {}),
      },
      include: { positions: { include: { candidates: true } } },
    });

    await this.addAuditLog(electionId, `STATUS_CHANGED_TO_${newStatus}`, actorId, 'RETURNING_OFFICER', `Status changed from ${election.status} to ${newStatus}`);
    return updated;
  }

  async nominateCandidate(societyId: string, electionId: string, dto: NominateCandidateDto, actorId: string) {
    const election = await this.findOne(societyId, electionId);
    if (!['NOMINATION_OPEN'].includes(election.status)) {
      throw new BadRequestException('Nominations are not currently open');
    }

    const position = election.positions.find((p: any) => p.id === dto.positionId);
    if (!position) throw new NotFoundException('Position not found');

    const candidate = await this.prisma.electionCandidate.create({
      data: {
        positionId: dto.positionId,
        personId: dto.candidatePersonId,
        candidateName: dto.candidateName,
        nominationType: dto.nominationType,
        status: 'SUBMITTED',
        manifesto: dto.manifesto,
        manifestoPdfUrl: dto.manifestoPdfUrl,
        photoUrl: dto.photoUrl,
        videoUrl: dto.videoUrl,
        submittedAt: new Date(),
      },
    });

    await this.addAuditLog(electionId, 'CANDIDATE_NOMINATED', actorId, dto.nominationType === 'SELF' ? 'RESIDENT' : 'SOCIETY_ADMIN', `${dto.candidateName} nominated for ${position.positionTitle}`);
    return candidate;
  }

  async updateCandidateStatus(societyId: string, electionId: string, candidateId: string, newStatus: string, actorId: string, reason?: string) {
    await this.findOne(societyId, electionId);

    if (!CANDIDATE_STATES.includes(newStatus)) {
      throw new BadRequestException(`Invalid candidate status: ${newStatus}`);
    }

    const data: any = { status: newStatus };
    if (newStatus === 'APPROVED') data.approvedAt = new Date();
    if (newStatus === 'WITHDRAWN') data.withdrawnAt = new Date();
    if (newStatus === 'DISQUALIFIED' || newStatus === 'REJECTED') data.rejectionReason = reason || 'Not specified';

    const updated = await this.prisma.electionCandidate.update({
      where: { id: candidateId },
      data,
    });

    await this.addAuditLog(electionId, `CANDIDATE_${newStatus}`, actorId, 'RETURNING_OFFICER', `Candidate ${candidateId} status changed to ${newStatus}`);
    return updated;
  }

  async castVote(societyId: string, electionId: string, dto: CastElectionVoteDto, voterId: string) {
    const election = await this.findOne(societyId, electionId);
    if (election.status !== 'VOTING_OPEN') {
      throw new BadRequestException('Voting is not currently open');
    }

    const voterHash = election.isSecretBallot
      ? crypto.createHash('sha256').update(`${electionId}-${voterId}-nestsphere-salt`).digest('hex')
      : voterId;

    const existing = await this.prisma.electionVote.findUnique({
      where: { positionId_voterHash: { positionId: dto.positionId, voterHash } },
    });
    if (existing) throw new BadRequestException('You have already voted for this position');

    const vote = await this.prisma.electionVote.create({
      data: {
        positionId: dto.positionId,
        voterHash,
        candidateId: dto.candidateId,
        source: dto.source,
        proxyId: dto.proxyPersonId || null,
      },
    });

    await this.addAuditLog(electionId, 'VOTE_CAST', voterHash, 'VOTER', `Vote cast for position ${dto.positionId} via ${dto.source}`);
    return { message: 'Vote recorded successfully', voteId: vote.id, timestamp: vote.castAt };
  }

  private async addAuditLog(electionId: string, action: string, actorId: string, actorRole: string, details: string) {
    await this.prisma.electionAuditLog.create({
      data: { electionId, action, actorId, actorRole, details },
    });
  }

  private async seedDefaultElectionIfEmpty() {
    try {
      const society = await this.prisma.society.findFirst({ where: { isDeleted: false } });
      if (!society) return;

      const count = await this.prisma.election.count({ where: { societyId: society.id } });
      if (count > 0) return;

      const election = await this.prisma.election.create({
        data: {
          societyId: society.id,
          title: '2026 Annual General Meeting Committee Election',
          description: 'Election for the 2026-2028 Management Committee of the society. All flat owners are eligible to vote and nominate candidates.',
          electionType: 'AGM_COMMITTEE',
          status: 'VOTING_OPEN',
          quorumPercentage: 50,
          isSecretBallot: true,
          allowProxy: true,
          votingRule: 'ONE_VOTE_PER_FLAT',
          nominationStartDate: new Date('2026-07-01'),
          nominationEndDate: new Date('2026-07-10'),
          scrutinyEndDate: new Date('2026-07-12'),
          withdrawalEndDate: new Date('2026-07-14'),
          campaignStartDate: new Date('2026-07-15'),
          campaignEndDate: new Date('2026-07-25'),
          votingStartDate: new Date('2026-07-26'),
          votingEndDate: new Date('2026-08-02'),
          resultDate: new Date('2026-08-03'),
          appealEndDate: new Date('2026-08-10'),
          positions: {
            create: [
              { positionTitle: 'CHAIRPERSON', seats: 1, description: 'Head of the Management Committee responsible for overall society governance' },
              { positionTitle: 'SECRETARY', seats: 1, description: 'Responsible for meeting minutes, correspondence, and administrative coordination' },
              { positionTitle: 'TREASURER', seats: 1, description: 'Manages society finances, budgets, and financial reporting' },
            ],
          },
        },
        include: { positions: true },
      });

      const candidateData = [
        { positionTitle: 'CHAIRPERSON', candidates: [
          { name: 'Rajesh Kumar', manifesto: 'Committed to transparent governance, improved security infrastructure, and green society initiatives for 2026-2028.' },
          { name: 'Priya Sharma', manifesto: 'Focus on digital transformation, smart parking solutions, and community engagement programs.' },
          { name: 'Amit Patel', manifesto: 'Dedicated to reducing maintenance costs, improving vendor accountability, and enhancing common area amenities.' },
        ]},
        { positionTitle: 'SECRETARY', candidates: [
          { name: 'Sunita Reddy', manifesto: 'Will ensure timely meeting minutes, transparent communication, and efficient complaint resolution.' },
          { name: 'Vikram Singh', manifesto: 'Experienced in society administration with focus on digital notice boards and automated workflows.' },
        ]},
        { positionTitle: 'TREASURER', candidates: [
          { name: 'Meena Joshi', manifesto: 'Chartered Accountant with 15 years experience. Will implement zero-variance budgeting and quarterly financial reviews.' },
          { name: 'Rahul Gupta', manifesto: 'Will focus on reducing outstanding dues, implementing early payment incentives, and transparent fund utilization.' },
          { name: 'Deepak Nair', manifesto: 'Experienced finance professional committed to building a healthy sinking fund and emergency reserves.' },
        ]},
      ];

      for (const posData of candidateData) {
        const position = election.positions.find(p => p.positionTitle === posData.positionTitle);
        if (!position) continue;

        for (const c of posData.candidates) {
          await this.prisma.electionCandidate.create({
            data: {
              positionId: position.id,
              personId: crypto.randomUUID(),
              candidateName: c.name,
              nominationType: 'SELF',
              status: 'APPROVED',
              manifesto: c.manifesto,
              submittedAt: new Date('2026-07-05'),
              approvedAt: new Date('2026-07-12'),
            },
          });
        }
      }
    } catch {
      // Silently skip seed errors
    }
  }
}
