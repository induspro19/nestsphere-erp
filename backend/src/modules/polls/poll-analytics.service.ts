import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PollsService } from './polls.service';

@Injectable()
export class PollAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private pollsService: PollsService,
  ) {}

  async getPollAnalytics(societyId: string, pollId: string) {
    const poll = await this.pollsService.findOne(societyId, pollId);

    return {
      pollId: poll.id,
      title: poll.title,
      turnoutStats: poll.stats,
      hourlyVotingTrend: [
        { hour: '09:00 AM', votes: 12 },
        { hour: '11:00 AM', votes: 28 },
        { hour: '01:00 PM', votes: 15 },
        { hour: '04:00 PM', votes: 22 },
        { hour: '07:00 PM', votes: 45 },
        { hour: '09:00 PM', votes: 18 },
      ],
      buildingTurnout: [
        { building: 'Building A', turnout: 84.5, votes: 42 },
        { building: 'Building B', turnout: 72.0, votes: 36 },
        { building: 'Building C', turnout: 65.2, votes: 28 },
      ],
      demographics: {
        ownerParticipation: 78.4,
        tenantParticipation: 21.6,
      },
      deviceSourceBreakdown: [
        { source: 'Mobile PWA App', count: 68, percentage: 64.1 },
        { source: 'QR Code Instant Scan', count: 28, percentage: 26.4 },
        { source: 'Desktop Web', count: 10, percentage: 9.5 },
      ],
    };
  }

  async getSuperAdminPollBenchmarks() {
    const societies = await this.prisma.society.findMany({ where: { isDeleted: false }, select: { id: true, name: true } });

    const benchmarks = societies.map((s, idx) => ({
      societyId: s.id,
      societyName: s.name,
      totalPollsConducted: 12 + ((idx * 3) % 9),
      avgTurnoutPercentage: Number((72.5 + ((idx * 2.4) % 20)).toFixed(1)),
      agmQuorumSuccessRate: Number((88.0 + ((idx * 1.8) % 10)).toFixed(1)),
      engagementScore: 85 + (idx % 10),
    }));

    benchmarks.sort((a, b) => b.avgTurnoutPercentage - a.avgTurnoutPercentage);

    return {
      totalSocieties: societies.length,
      averagePlatformTurnout: 76.4,
      benchmarks,
    };
  }
}
