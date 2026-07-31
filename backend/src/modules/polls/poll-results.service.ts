import { Injectable } from '@nestjs/common';
import { PollsService } from './polls.service';

@Injectable()
export class PollResultsService {
  constructor(private readonly pollsService: PollsService) {}

  async getPollResults(societyId: string, pollId: string) {
    const pollWithStats = await this.pollsService.findOne(societyId, pollId);

    const totalVotes = pollWithStats.stats.totalVotes || 0;

    const breakdown = pollWithStats.choices.map((choice: any) => {
      const percentage = totalVotes > 0 ? Number(((choice.voteCount / totalVotes) * 100).toFixed(1)) : 0;
      return {
        id: choice.id,
        text: choice.text,
        description: choice.description,
        voteCount: choice.voteCount,
        percentage,
      };
    });

    const leadingChoice = breakdown.reduce((max: any, curr: any) => (curr.voteCount > (max?.voteCount || -1) ? curr : max), null);

    return {
      pollId: pollWithStats.id,
      title: pollWithStats.title,
      pollType: pollWithStats.pollType,
      status: pollWithStats.status,
      isSecretBallot: pollWithStats.isSecretBallot,
      quorumPercentage: pollWithStats.quorumPercentage,
      quorumMet: pollWithStats.stats.quorumMet,
      turnoutPercentage: pollWithStats.stats.turnoutPercentage,
      totalVotes,
      leadingChoice: leadingChoice ? leadingChoice.text : 'N/A',
      breakdown,
    };
  }
}
