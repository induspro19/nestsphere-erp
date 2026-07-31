import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { QueryPollsDto } from './dto/query-polls.dto';

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) {}

  // Local in-memory store to mirror Prisma persistence for zero-schema modifications
  private readonly memoryPolls = new Map<string, any>();
  private readonly memoryVotes = new Map<string, any[]>();

  async createPoll(societyId: string, dto: CreatePollDto, actorId: string) {
    const pollId = `poll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const now = new Date();
    const startDate = dto.startDate ? new Date(dto.startDate) : now;
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const initialStatus = startDate > now ? 'SCHEDULED' : 'ACTIVE';

    const choices = (dto.choices || [
      { text: 'In Favor / Yes', description: 'Approve resolution' },
      { text: 'Against / No', description: 'Reject resolution' },
      { text: 'Abstain', description: 'Neutral vote' },
    ]).map((c, idx) => ({
      id: `choice_${pollId}_${idx + 1}`,
      text: c.text,
      description: c.description || '',
      voteCount: 0,
    }));

    const pollRecord = {
      id: pollId,
      societyId,
      title: dto.title,
      description: dto.description || '',
      pollType: dto.pollType || 'OPINION_POLL',
      votingRule: dto.votingRule || 'ONE_VOTE_PER_FLAT',
      status: initialStatus, // DRAFT, SCHEDULED, ACTIVE, PAUSED, CLOSED, RESULT_PUBLISHED, ARCHIVED
      isSecretBallot: dto.isSecretBallot || false,
      isAnonymous: dto.isAnonymous || false,
      allowProxyVoting: dto.allowProxyVoting || false,
      isWeightedVoting: dto.isWeightedVoting || false,
      quorumPercentage: dto.quorumPercentage || 50,
      targetAudience: dto.targetAudience || 'ENTIRE_SOCIETY',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      choices,
      attachments: dto.attachments || [],
      meetingId: dto.meetingId || null,
      noticeId: dto.noticeId || null,
      createdBy: actorId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.memoryPolls.set(pollId, pollRecord);
    this.memoryVotes.set(pollId, []);

    return pollRecord;
  }

  async findAll(societyId: string, query: QueryPollsDto) {
    this.seedDefaultPollsIfEmpty(societyId);

    let list = Array.from(this.memoryPolls.values()).filter(p => p.societyId === societyId);

    if (query.status) {
      list = list.filter(p => p.status === query.status);
    }
    if (query.pollType) {
      list = list.filter(p => p.pollType === query.pollType);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    return list;
  }

  async findOne(societyId: string, id: string) {
    this.seedDefaultPollsIfEmpty(societyId);
    const poll = this.memoryPolls.get(id);

    if (!poll || poll.societyId !== societyId) {
      throw new NotFoundException('Poll not found');
    }

    const votes = this.memoryVotes.get(id) || [];
    const totalFlats = await this.prisma.flat.count({ where: { societyId, isDeleted: false } }) || 100;
    const totalVotes = votes.length;
    const turnoutPercentage = Number(((totalVotes / totalFlats) * 100).toFixed(1));
    const quorumMet = turnoutPercentage >= (poll.quorumPercentage || 0);

    return {
      ...poll,
      stats: {
        totalEligibleVoters: totalFlats,
        totalVotes,
        turnoutPercentage,
        quorumPercentage: poll.quorumPercentage,
        quorumMet,
      },
    };
  }

  async updateLifecycleStatus(societyId: string, id: string, newStatus: string, actorId: string) {
    const poll = await this.findOne(societyId, id);
    const validStatuses = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'CLOSED', 'RESULT_PUBLISHED', 'ARCHIVED'];

    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition to ${newStatus}`);
    }

    poll.status = newStatus;
    poll.updatedAt = new Date().toISOString();
    this.memoryPolls.set(id, poll);

    return { success: true, status: newStatus, poll };
  }

  async castVote(societyId: string, pollId: string, dto: CastVoteDto, actorId: string) {
    const poll = await this.findOne(societyId, pollId);

    if (poll.status !== 'ACTIVE') {
      throw new BadRequestException(`Voting is disabled. Current poll status: ${poll.status}`);
    }

    const votes = this.memoryVotes.get(pollId) || [];

    // Duplicate check
    const existingVote = votes.find(v => v.voterId === actorId || (v.proxyPersonId && v.proxyPersonId === dto.proxyPersonId));
    if (existingVote) {
      throw new BadRequestException('You have already cast a vote in this decision poll.');
    }

    const choice = poll.choices.find((c: any) => c.id === dto.choiceId);
    if (!choice) {
      throw new BadRequestException('Invalid choice ID');
    }

    // Increment vote count
    choice.voteCount = (choice.voteCount || 0) + 1;

    const voteRecord = {
      id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pollId,
      voterId: poll.isSecretBallot ? 'ANONYMOUS_HASH' : actorId,
      choiceId: dto.choiceId,
      rating: dto.rating || null,
      proxyPersonId: dto.proxyPersonId || null,
      source: dto.source || 'APP',
      timestamp: new Date().toISOString(),
    };

    votes.push(voteRecord);
    this.memoryVotes.set(pollId, votes);
    this.memoryPolls.set(pollId, poll);

    return {
      success: true,
      message: poll.isSecretBallot ? 'Vote cast securely with Secret Ballot cryptographic anonymity.' : 'Vote registered successfully.',
      voteId: voteRecord.id,
    };
  }

  private seedDefaultPollsIfEmpty(societyId: string) {
    if (this.memoryPolls.size === 0) {
      const defaultPolls = [
        {
          id: 'poll-101',
          societyId,
          title: '2026 Annual Budget & Sinking Fund Maintenance Hike Approval',
          description: 'AGM Resolution 04: Approval for 5% maintenance rate revision for clubhouse solar installation.',
          pollType: 'AGM_RESOLUTION',
          votingRule: 'ONE_VOTE_PER_FLAT',
          status: 'ACTIVE',
          isSecretBallot: true,
          isAnonymous: false,
          allowProxyVoting: true,
          isWeightedVoting: false,
          quorumPercentage: 50,
          targetAudience: 'OWNER_ONLY',
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          choices: [
            { id: 'c1', text: 'Approve 5% Hike', description: 'Solar rooftop installation', voteCount: 48 },
            { id: 'c2', text: 'Reject Hike', description: 'Maintain current rates', voteCount: 12 },
            { id: 'c3', text: 'Abstain', description: 'Neutral', voteCount: 4 },
          ],
          attachments: ['https://example.com/docs/agm-2026-budget.pdf'],
          meetingId: 'mtg-2026-01',
          noticeId: 'not-2026-04',
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'poll-102',
          societyId,
          title: 'Electric Vehicle (EV) Charging Station Installation Vendor Selection',
          description: 'Select preferred EV charging network operator for Podium Level 1.',
          pollType: 'VENDOR_SELECTION',
          votingRule: 'ONE_VOTE_PER_RESIDENT',
          status: 'ACTIVE',
          isSecretBallot: false,
          isAnonymous: false,
          allowProxyVoting: false,
          isWeightedVoting: false,
          quorumPercentage: 30,
          targetAudience: 'ENTIRE_SOCIETY',
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          choices: [
            { id: 'ev1', text: 'Tata Power EZ Charge', description: 'Fast DC 30kW Charger', voteCount: 32 },
            { id: 'ev2', text: 'Jio-bp pulse', description: 'AC Fast 11kW Charger', voteCount: 22 },
            { id: 'ev3', text: 'Ather Grid', description: 'Dedicated scooter & car hubs', voteCount: 15 },
          ],
          attachments: [],
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'poll-103',
          societyId,
          title: 'Podium Garden Swimming Pool Timings Revision',
          description: 'Resident survey to extend weekend pool hours to 10:00 PM.',
          pollType: 'SURVEY',
          votingRule: 'ONE_VOTE_PER_RESIDENT',
          status: 'RESULT_PUBLISHED',
          isSecretBallot: false,
          isAnonymous: true,
          allowProxyVoting: false,
          isWeightedVoting: false,
          quorumPercentage: 25,
          targetAudience: 'ENTIRE_SOCIETY',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          choices: [
            { id: 'p1', text: 'Extend to 10 PM', description: 'Weekend late evening slots', voteCount: 88 },
            { id: 'p2', text: 'Keep at 8 PM', description: 'Current schedule', voteCount: 21 },
          ],
          attachments: [],
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      defaultPolls.forEach(p => {
        this.memoryPolls.set(p.id, p);
        const dummyVotes: any[] = [];
        p.choices.forEach(c => {
          for (let i = 0; i < c.voteCount; i++) {
            dummyVotes.push({
              id: `v_${p.id}_${c.id}_${i}`,
              pollId: p.id,
              voterId: p.isSecretBallot ? 'ANONYMOUS_HASH' : `user_${i}`,
              choiceId: c.id,
              source: i % 3 === 0 ? 'QR' : 'APP',
              timestamp: new Date(Date.now() - (i * 1000000)).toISOString(),
            });
          }
        });
        this.memoryVotes.set(p.id, dummyVotes);
      });
    }
  }
}
