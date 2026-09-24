import { Injectable } from '@nestjs/common';
import { toInt, toIntOrZero } from 'src/common/formatting/numbers';
import { formString } from 'src/common/formatting/result.util';
import { TEAM_PAGE_NOTE } from 'src/common/provenance/notes';
import { mergeSummaries, sourceRef, summariseCounts } from 'src/common/provenance/source.util';
import { formatSortKey, MatchFormat } from 'src/database/enums/cricket.enums';
import { MatchListService } from 'src/modules/match-list/match-list.service';
import { RecordsService } from 'src/modules/records/records.service';
import { TeamHeadToHeadDto } from './dto/team-head-to-head.dto';
import { FormatRecordDto, TeamPageDto } from './dto/team-page.dto';
import { TeamQueryDto } from './dto/team-query.dto';
import { FormatRecordRow, TeamsRepository } from './teams.repository';

const RECENT_LIMIT = 5;
const H2H_MATCH_LIMIT = 20;

@Injectable()
export class TeamsService {
  constructor(
    private readonly repository: TeamsRepository,
    private readonly records: RecordsService,
    private readonly matchList: MatchListService,
  ) {}

  async getTeam(
    teamId: string,
    format: MatchFormat | null,
    limit = RECENT_LIMIT,
  ): Promise<TeamPageDto | null> {
    const team = await this.repository.findTeam(teamId);
    if (!team) return null;

    const [recordRows, recentMatches] = await Promise.all([
      this.repository.formatRecords(teamId, format),
      this.records.recentMatches(teamId, { limit, format }),
    ]);

    const results = recordRows
      .map(this.toFormatRecord)
      .sort((a, b) => formatSortKey(a.format) - formatSortKey(b.format));

    return {
      team_id: team.team_id,
      ...sourceRef(team.source),
      name: team.name,
      short_name: team.short_name,
      country: team.country,
      gender: team.gender,
      is_national: team.is_national,
      sofa_id: toInt(team.sofa_id),
      format,
      results,
      form: formString(recentMatches),
      recent_matches: recentMatches,
      sources: mergeSummaries(
        results.map((record) => record.sources),
        TEAM_PAGE_NOTE,
      ),
    };
  }

  async headToHead(
    teamAId: string,
    teamBId: string,
    query: TeamQueryDto,
  ): Promise<TeamHeadToHeadDto | null> {
    const [teamA, teamB] = await Promise.all([
      this.repository.findTeam(teamAId),
      this.repository.findTeam(teamBId),
    ]);
    if (!teamA || !teamB) return null;

    const format = query.format ?? null;
    const sides = [
      { id: teamA.team_id, name: teamA.name },
      { id: teamB.team_id, name: teamB.name },
    ] as const;

    const [record, matches] = await Promise.all([
      this.records.headToHead(sides[0], sides[1], { format }),
      this.matchList.findMatches({
        teamIds: [teamA.team_id, teamB.team_id],
        format,
        completedOnly: true,
        limit: query.limit ?? H2H_MATCH_LIMIT,
      }),
    ]);

    // `record.sources` already spans every meeting, of which `matches` is a capped subset.
    return { ...record, filters: { format }, count: matches.length, matches };
  }

  private toFormatRecord(row: FormatRecordRow): FormatRecordDto {
    return {
      format: row.format,
      played: toIntOrZero(row.played),
      won: toIntOrZero(row.won),
      lost: toIntOrZero(row.lost),
      drawn: toIntOrZero(row.drawn),
      tied: toIntOrZero(row.tied),
      no_result: toIntOrZero(row.no_result),
      sources: summariseCounts(row, TEAM_PAGE_NOTE),
    };
  }
}
