import { Injectable } from '@nestjs/common';
import { PollResultsService } from './poll-results.service';

@Injectable()
export class PollExportService {
  constructor(private readonly resultsService: PollResultsService) {}

  async generateResultCsv(societyId: string, pollId: string): Promise<string> {
    const results = await this.resultsService.getPollResults(societyId, pollId);

    const headers = 'Option ID,Option Text,Description,Vote Count,Percentage (%)';
    const rows = results.breakdown.map(
      (b: any) => `"${b.id}","${b.text.replace(/"/g, '""')}","${b.description.replace(/"/g, '""')}",${b.voteCount},${b.percentage}`
    );

    return [
      `"Poll Title: ${results.title}"`,
      `"Status: ${results.status}"`,
      `"Quorum Met: ${results.quorumMet ? 'YES' : 'NO'} (${results.turnoutPercentage}% Turnout vs ${results.quorumPercentage}% Required)"`,
      `"Total Votes Cast: ${results.totalVotes}"`,
      '',
      headers,
      ...rows,
    ].join('\n');
  }
}
