import { Injectable } from '@nestjs/common';
import { toIntOrZero } from 'src/common/formatting/numbers';
import { formString, outcomeLetter, sideSummary } from 'src/common/formatting/result.util';
import { HEAD_TO_HEAD_NOTE } from 'src/common/provenance/notes';
import { summariseCounts } from 'src/common/provenance/source.util';
import { FormMatchDto, HeadToHeadDto, TeamFormDto } from './dto/records.dto';
import {
  HeadToHeadOptions,
  RecentMatchesOptions,
  RecentMatchRow,
  RecordsRepository,
} from './records.repository';

export interface TeamRef {
  id: string;
  name: string;
}

@Injectable()
export class RecordsService {
  constructor(private readonly repository: RecordsRepository) {}

  async recentMatches(teamId: string, options?: RecentMatchesOptions): Promise<FormMatchDto[]> {
    const rows = await this.repository.recentTeamMatches(teamId, options);
    return rows.map((row) => this.toFormMatch(row, teamId));
  }

  async teamForm(team: TeamRef, options?: RecentMatchesOptions): Promise<TeamFormDto> {
    const matches = await this.recentMatches(team.id, options);
    return {
      team_id: team.id,
      name: team.name,
      form: formString(matches),
      matches,
    };
  }

  async headToHead(
    teamA: TeamRef,
    teamB: TeamRef,
    options?: HeadToHeadOptions,
  ): Promise<HeadToHeadDto> {
    const row = await this.repository.headToHead(teamA.id, teamB.id, options);
    return {
      played: toIntOrZero(row.played),
      drawn: toIntOrZero(row.drawn),
      tied: toIntOrZero(row.tied),
      no_result: toIntOrZero(row.no_result),
      teams: [
        { id: teamA.id, name: teamA.name, won: toIntOrZero(row.won_a) },
        { id: teamB.id, name: teamB.name, won: toIntOrZero(row.won_b) },
      ],
      sources: summariseCounts(row, HEAD_TO_HEAD_NOTE),
    };
  }

  private toFormMatch(row: RecentMatchRow, teamId: string): FormMatchDto {
    const letter = outcomeLetter(row.result_type, row.winner_id, teamId);
    return {
      match_id: row.match_id,
      start_date: row.start_date,
      format: row.format,
      competition: row.competition,
      opponent_id: row.opponent_id,
      opponent: row.opponent,
      result: letter,
      summary: sideSummary(letter, row.opponent, row.win_margin, row.win_margin_unit),
    };
  }
}
