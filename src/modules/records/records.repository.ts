import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { SourceCountRow, sourceCountSelects } from 'src/common/provenance/source.util';
import { Competition, Match, MatchTeam, Team } from 'src/database/entities';
import { MatchFormat, MatchStatus } from 'src/database/enums/cricket.enums';
import { Repository } from 'typeorm';

export interface RecentMatchRow {
  match_id: string;
  start_date: string;
  format: string;
  result_type: string | null;
  win_margin: Numeric;
  win_margin_unit: string | null;
  winner_id: string | null;
  competition: string | null;
  opponent_id: string | null;
  opponent: string | null;
}

export interface HeadToHeadRow extends SourceCountRow {
  played: Numeric;
  won_a: Numeric;
  won_b: Numeric;
  drawn: Numeric;
  tied: Numeric;
  no_result: Numeric;
}

export interface RecentMatchesOptions {
  limit?: number;
  format?: MatchFormat | null;
  beforeDate?: string | null;
  excludeMatchId?: string | null;
}

export interface HeadToHeadOptions {
  format?: MatchFormat | null;
}

@Injectable()
export class RecordsRepository {
  constructor(@InjectRepository(Match) private readonly matches: Repository<Match>) {}

  recentTeamMatches(teamId: string, options: RecentMatchesOptions = {}): Promise<RecentMatchRow[]> {
    const { limit = 5, format = null, beforeDate = null, excludeMatchId = null } = options;

    const qb = this.matches
      .createQueryBuilder('m')
      .select('CAST(m.matchId AS text)', 'match_id')
      .addSelect('m.startDate', 'start_date')
      .addSelect('CAST(m.format AS text)', 'format')
      .addSelect('CAST(m.resultType AS text)', 'result_type')
      .addSelect('m.winMargin', 'win_margin')
      .addSelect('CAST(m.winMarginUnit AS text)', 'win_margin_unit')
      .addSelect('CAST(m.winnerTeamId AS text)', 'winner_id')
      .addSelect('c.name', 'competition')
      .addSelect(
        (sub) =>
          sub
            .select('CAST(opponent.teamId AS text)')
            .from(MatchTeam, 'opponent')
            .where('opponent.matchId = m.match_id')
            .andWhere('opponent.teamId <> CAST(:teamId AS uuid)')
            .orderBy('opponent.battingOrderSide')
            .limit(1),
        'opponent_id',
      )
      .addSelect(
        (sub) =>
          sub
            .select('opponentTeam.name')
            .from(MatchTeam, 'opponentSide')
            .innerJoin(Team, 'opponentTeam', 'opponentTeam.teamId = opponentSide.teamId')
            .where('opponentSide.matchId = m.match_id')
            .andWhere('opponentSide.teamId <> CAST(:teamId AS uuid)')
            .orderBy('opponentSide.battingOrderSide')
            .limit(1),
        'opponent',
      )
      .innerJoin(MatchTeam, 'mt', 'mt.matchId = m.matchId AND mt.teamId = CAST(:teamId AS uuid)')
      .leftJoin(Competition, 'c', 'c.competitionId = m.competitionId')
      .where('m.status = :status', { status: MatchStatus.Completed })
      .setParameter('teamId', teamId)
      .orderBy('m.startDate', 'DESC')
      .addOrderBy('m.matchId', 'DESC')
      .limit(limit);

    if (format) {
      qb.andWhere('m.format = CAST(:format AS cricket.match_format)', { format });
    }
    if (beforeDate) {
      qb.andWhere('m.startDate <= CAST(:beforeDate AS date)', { beforeDate });
    }
    if (excludeMatchId) {
      qb.andWhere('m.matchId <> CAST(:excludeMatchId AS uuid)', { excludeMatchId });
    }

    return qb.getRawMany<RecentMatchRow>();
  }

  async headToHead(
    teamAId: string,
    teamBId: string,
    options: HeadToHeadOptions = {},
  ): Promise<HeadToHeadRow> {
    const { format = null } = options;

    const qb = this.matches
      .createQueryBuilder('m')
      .select('count(*)', 'played')
      .addSelect('count(*) FILTER (WHERE m.winner_team_id = CAST(:teamAId AS uuid))', 'won_a')
      .addSelect('count(*) FILTER (WHERE m.winner_team_id = CAST(:teamBId AS uuid))', 'won_b')
      .addSelect(
        "count(*) FILTER (WHERE m.result_type = 'drawn' AND m.winner_team_id IS NULL)",
        'drawn',
      )
      .addSelect(
        "count(*) FILTER (WHERE m.result_type = 'tied' AND m.winner_team_id IS NULL)",
        'tied',
      )
      .addSelect(
        `count(*) FILTER (
           WHERE m.winner_team_id IS NULL
             AND m.result_type IS DISTINCT FROM 'drawn'
             AND m.result_type IS DISTINCT FROM 'tied'
         )`,
        'no_result',
      )
      .innerJoin(MatchTeam, 'ta', 'ta.matchId = m.matchId AND ta.teamId = CAST(:teamAId AS uuid)')
      .innerJoin(MatchTeam, 'tb', 'tb.matchId = m.matchId AND tb.teamId = CAST(:teamBId AS uuid)')
      .where('m.status = :status', { status: MatchStatus.Completed })
      .setParameters({ teamAId, teamBId });

    for (const [expression, alias] of sourceCountSelects('m.row_source')) {
      qb.addSelect(expression, alias);
    }

    if (format) {
      qb.andWhere('m.format = CAST(:format AS cricket.match_format)', { format });
    }

    return (await qb.getRawOne<HeadToHeadRow>()) as HeadToHeadRow;
  }
}
