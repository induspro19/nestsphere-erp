import { Injectable } from '@nestjs/common';
import { ElectionResultsService } from './election-results.service';

@Injectable()
export class ElectionCertificatesService {
  constructor(private readonly resultsService: ElectionResultsService) {}

  async generateCertificate(societyId: string, electionId: string, type: string) {
    const results = await this.resultsService.getResults(societyId, electionId);
    if (!results) return null;

    const now = new Date().toISOString();

    switch (type) {
      case 'result-report':
        return {
          certificateType: 'ELECTION_RESULT_REPORT',
          title: `Election Result Report — ${results.title}`,
          generatedAt: now,
          electionType: results.electionType,
          totalEligibleVoters: results.totalEligibleVoters,
          totalVotesCast: results.uniqueVoterCount,
          turnoutPercentage: results.turnoutPercentage,
          quorumMet: results.quorumMet,
          positionResults: results.positionResults.map((pr: any) => ({
            position: pr.positionTitle,
            seats: pr.seats,
            totalVotes: pr.totalVotes,
            winner: pr.winners[0]?.candidateName || 'Pending',
            winnerVotes: pr.winners[0]?.voteCount || 0,
            winnerPercentage: pr.winners[0]?.percentage || 0,
            hasTie: pr.hasTie,
          })),
        };

      case 'winner':
        return {
          certificateType: 'WINNER_CERTIFICATE',
          title: `Winner Certificate — ${results.title}`,
          generatedAt: now,
          winners: results.positionResults.flatMap((pr: any) =>
            pr.winners.map((w: any) => ({
              position: pr.positionTitle,
              name: w.candidateName,
              votes: w.voteCount,
              percentage: w.percentage,
              electedOn: now,
            })),
          ),
        };

      case 'returning-officer':
        return {
          certificateType: 'RETURNING_OFFICER_CERTIFICATE',
          title: `Returning Officer Certification — ${results.title}`,
          generatedAt: now,
          certification: `I, the undersigned Returning Officer, hereby certify that the election "${results.title}" was conducted in a free and fair manner in accordance with the society bylaws. The results declared are accurate and final.`,
          totalVotesCast: results.uniqueVoterCount,
          turnoutPercentage: results.turnoutPercentage,
          quorumMet: results.quorumMet,
          positionsContested: results.positionResults.length,
        };

      case 'committee-formation':
        return {
          certificateType: 'COMMITTEE_FORMATION_REPORT',
          title: `Committee Formation Report — ${results.title}`,
          generatedAt: now,
          committee: results.positionResults.flatMap((pr: any) =>
            pr.winners.map((w: any) => ({
              position: pr.positionTitle,
              name: w.candidateName,
              electedWith: `${w.voteCount} votes (${w.percentage}%)`,
            })),
          ),
          tenureStart: now,
          tenureEnd: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

      case 'audit':
        return {
          certificateType: 'ELECTION_AUDIT_REPORT',
          title: `Election Audit Report — ${results.title}`,
          generatedAt: now,
          electionId: results.electionId,
          status: results.status,
          isSecretBallot: results.isSecretBallot,
          totalVotesCast: results.uniqueVoterCount,
          turnoutPercentage: results.turnoutPercentage,
          quorumRequired: results.quorumPercentage,
          quorumMet: results.quorumMet,
          positionSummary: results.positionResults.map((pr: any) => ({
            position: pr.positionTitle,
            candidatesContested: pr.candidates.length,
            totalVotes: pr.totalVotes,
            winner: pr.winners[0]?.candidateName || 'Pending',
            hasTie: pr.hasTie,
          })),
        };

      default:
        return { error: `Unknown certificate type: ${type}` };
    }
  }
}
