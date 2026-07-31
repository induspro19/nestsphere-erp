import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ElectionResultsService {
  constructor(private prisma: PrismaService) {}

  async getResults(societyId: string, electionId: string) {
    const election = await this.prisma.election.findFirst({
      where: { id: electionId, societyId, isDeleted: false },
      include: {
        positions: {
          include: {
            candidates: true,
            votes: true,
          },
        },
      },
    });

    if (!election) return null;

    const totalEligibleVoters = 120; // Would be calculated from society flat count
    const allVotes = election.positions.flatMap((p: any) => p.votes);
    const uniqueVoters = new Set(allVotes.map((v: any) => v.voterHash));
    const turnoutPercentage = totalEligibleVoters > 0
      ? Number(((uniqueVoters.size / totalEligibleVoters) * 100).toFixed(1))
      : 0;

    const positionResults = election.positions.map((position: any) => {
      const positionVotes = position.votes || [];
      const totalPositionVotes = positionVotes.length;

      const candidateResults = position.candidates
        .filter((c: any) => c.status === 'APPROVED' || c.status === 'CAMPAIGN')
        .map((candidate: any) => {
          const voteCount = positionVotes.filter((v: any) => v.candidateId === candidate.id).length;
          const percentage = totalPositionVotes > 0 ? Number(((voteCount / totalPositionVotes) * 100).toFixed(1)) : 0;

          return {
            candidateId: candidate.id,
            candidateName: candidate.candidateName,
            personId: candidate.personId,
            voteCount,
            percentage,
          };
        })
        .sort((a: any, b: any) => b.voteCount - a.voteCount);

      // Detect tie (top 2 within 1% margin)
      const hasTie = candidateResults.length >= 2 &&
        Math.abs(candidateResults[0].percentage - candidateResults[1].percentage) <= 1.0;

      // Detect winners (top N by seat count)
      const winners = candidateResults.slice(0, position.seats);

      return {
        positionId: position.id,
        positionTitle: position.positionTitle,
        seats: position.seats,
        totalVotes: totalPositionVotes,
        candidates: candidateResults,
        winners,
        hasTie,
        requiresRunoff: hasTie,
      };
    });

    return {
      electionId: election.id,
      title: election.title,
      electionType: election.electionType,
      status: election.status,
      isSecretBallot: election.isSecretBallot,
      quorumPercentage: election.quorumPercentage,
      totalEligibleVoters,
      uniqueVoterCount: uniqueVoters.size,
      turnoutPercentage,
      quorumMet: turnoutPercentage >= election.quorumPercentage,
      positionResults,
    };
  }
}
