import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CommitteeService {
  constructor(private prisma: PrismaService) {}

  async formCommitteeFromElection(societyId: string, electionId: string, winners: any[]) {
    const now = new Date();
    const tenureEnd = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // 2-year tenure

    const committee = await this.prisma.committee.create({
      data: {
        societyId,
        electionId,
        name: `Management Committee ${now.getFullYear()}-${tenureEnd.getFullYear()}`,
        tenureStartDate: now,
        tenureEndDate: tenureEnd,
        status: 'ACTIVE',
        members: {
          create: winners.map((w: any) => ({
            personId: w.personId || w.candidateId,
            memberName: w.candidateName,
            position: w.position,
          })),
        },
      },
      include: { members: true },
    });

    return committee;
  }

  async getActiveCommittee(societyId: string) {
    const committee = await this.prisma.committee.findFirst({
      where: { societyId, status: 'ACTIVE' },
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!committee) return null;

    const now = new Date();
    const totalTenure = committee.tenureEndDate.getTime() - committee.tenureStartDate.getTime();
    const elapsed = now.getTime() - committee.tenureStartDate.getTime();
    const tenureProgressPercentage = Math.min(100, Number(((elapsed / totalTenure) * 100).toFixed(1)));
    const daysRemaining = Math.max(0, Math.ceil((committee.tenureEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ...committee,
      tenureProgressPercentage,
      daysRemaining,
      isExpiringSoon: daysRemaining <= 90,
    };
  }

  async getPastCommittees(societyId: string) {
    return this.prisma.committee.findMany({
      where: { societyId, status: { not: 'ACTIVE' } },
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkTenureExpiry(societyId: string) {
    const active = await this.getActiveCommittee(societyId);
    if (!active) return { needsElection: true, message: 'No active committee found. An election should be scheduled.' };

    if (active.isExpiringSoon) {
      return {
        needsElection: true,
        message: `Committee tenure expires in ${active.daysRemaining} days. Schedule next election.`,
        committee: active,
      };
    }

    return { needsElection: false, message: 'Committee tenure is active.', committee: active };
  }
}
