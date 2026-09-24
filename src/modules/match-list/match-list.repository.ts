import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { Competition, Match, MatchTeam, Team, Venue } from 'src/database/entities';
import { MatchFormat, MatchStatus } from 'src/database/enums/cricket.enums';
import { Repository } from 'typeorm';

export interface MatchSummaryRow {
  id: string;
  source: string;
  daft_match_id: string | null;
  sofa_id: Numeric;
  start_date: string;
  end_date: string | null;
  format: string;
  gender: string;
  status: string;
  competition_id: string | null;
  competition_name: string | null;
  competition_source: string | null;
  venue_id: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_country: string | null;
  venue_source: string | null;
  result_type: string | null;
  winner_id: string | null;
  winner: string | null;
  win_margin: Numeric;
  win_margin_unit: string | null;
}

export interface MatchSideRow {
  match_id: string;
  id: string;
  name: string;
  source: string;
  batting_order_side: Numeric;
  is_home: boolean | null;
}

export interface MatchListFilters {
  /** Every id must have played, so a pair expresses a head-to-head. */
  teamIds?: readonly string[];
  venueId?: string | null;
  matchId?: string | null;
  country?: string | null;
  format?: MatchFormat | null;
  completedOnly?: boolean;
  limit?: number;
}

export const DEFAULT_MATCH_LIMIT = 20;

@Injectable()
export class MatchListRepository {
  constructor(@InjectRepository(Match) private readonly matches: Repository<Match>) {}

  findMatches(filters: MatchListFilters = {}): Promise<MatchSummaryRow[]> {
    const {
      teamIds = [],
      venueId = null,
      matchId = null,
      country = null,
      format = null,
      completedOnly = false,
      limit = DEFAULT_MATCH_LIMIT,
    } = filters;

    const qb = this.matches
      .createQueryBuilder('m')
      .select('CAST(m.matchId AS text)', 'id')
      .addSelect('CAST(m.rowSource AS text)', 'source')
      .addSelect('m.daftMatchId', 'daft_match_id')
      .addSelect('m.sofaId', 'sofa_id')
      .addSelect('m.startDate', 'start_date')
      .addSelect('m.endDate', 'end_date')
      .addSelect('CAST(m.format AS text)', 'format')
      .addSelect('CAST(m.gender AS text)', 'gender')
      .addSelect('CAST(m.status AS text)', 'status')
      .addSelect('CAST(c.competitionId AS text)', 'competition_id')
      .addSelect('c.name', 'competition_name')
      .addSelect('CAST(c.rowSource AS text)', 'competition_source')
      .addSelect('CAST(v.venueId AS text)', 'venue_id')
      .addSelect('v.name', 'venue_name')
      .addSelect('v.city', 'venue_city')
      .addSelect('v.country', 'venue_country')
      .addSelect('CAST(v.rowSource AS text)', 'venue_source')
      .addSelect('CAST(m.resultType AS text)', 'result_type')
      .addSelect('CAST(m.winnerTeamId AS text)', 'winner_id')
      .addSelect('winnerTeam.name', 'winner')
      .addSelect('m.winMargin', 'win_margin')
      .addSelect('CAST(m.winMarginUnit AS text)', 'win_margin_unit')
      .leftJoin(Competition, 'c', 'c.competitionId = m.competitionId')
      .leftJoin(Venue, 'v', 'v.venueId = m.venueId')
      .leftJoin(Team, 'winnerTeam', 'winnerTeam.teamId = m.winnerTeamId')
      .orderBy('m.startDate', 'DESC')
      .addOrderBy('m.matchId', 'DESC')
      .limit(limit);

    teamIds.forEach((teamId, index) => {
      const alias = `side${index}`;
      qb.innerJoin(
        MatchTeam,
        alias,
        `${alias}.matchId = m.matchId AND ${alias}.teamId = CAST(:${alias} AS uuid)`,
        { [alias]: teamId },
      );
    });

    if (venueId) qb.andWhere('m.venueId = CAST(:venueId AS uuid)', { venueId });
    if (matchId) qb.andWhere('m.matchId = CAST(:matchId AS uuid)', { matchId });
    if (country) qb.andWhere('lower(v.country) = lower(:country)', { country });
    if (format) qb.andWhere('m.format = CAST(:format AS cricket.match_format)', { format });
    if (completedOnly) qb.andWhere('m.status = :status', { status: MatchStatus.Completed });

    return qb.getRawMany<MatchSummaryRow>();
  }

  /** One round trip for every match in a list, instead of one query per match. */
  findSides(matchIds: readonly string[]): Promise<MatchSideRow[]> {
    if (matchIds.length === 0) return Promise.resolve([]);
    return this.matches.manager
      .createQueryBuilder(MatchTeam, 'mt')
      .select('CAST(mt.matchId AS text)', 'match_id')
      .addSelect('CAST(t.teamId AS text)', 'id')
      .addSelect('t.name', 'name')
      .addSelect('CAST(t.rowSource AS text)', 'source')
      .addSelect('mt.battingOrderSide', 'batting_order_side')
      .addSelect('mt.isHome', 'is_home')
      .innerJoin(Team, 't', 't.teamId = mt.teamId')
      .where('mt.matchId IN (:...matchIds)', { matchIds })
      .orderBy('mt.battingOrderSide')
      .getRawMany<MatchSideRow>();
  }
}
