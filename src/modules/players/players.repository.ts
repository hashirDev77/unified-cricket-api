import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { SourceCountRow, sourceCountSelects } from 'src/common/provenance/source.util';
import { Batting, Bowling, Innings, Match, MatchTeam, Player, Team } from 'src/database/entities';
import { MatchFormat } from 'src/database/enums/cricket.enums';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export interface PlayerRow {
  player_id: string;
  source: string;
  full_name: string;
  known_as: string | null;
  country_alpha2: string | null;
  bats: string | null;
  bowls: string | null;
  bowling_styles: string[] | null;
  birth_date: string | null;
  daft_player_key: string | null;
  sofa_id: number | null;
  identity_glued: boolean;
}

export interface BattingAggregateRow extends SourceCountRow {
  innings: Numeric;
  outs: Numeric;
  runs: Numeric;
  balls_faced: Numeric;
  runs_with_balls: Numeric;
  innings_with_balls: Numeric;
  hundreds: Numeric;
  fifties: Numeric;
  fours: Numeric;
  sixes: Numeric;
}

export interface HighestScoreRow {
  runs: Numeric;
  is_out: boolean | null;
}

export interface BowlingAggregateRow extends SourceCountRow {
  innings: Numeric;
  legal_balls: Numeric;
  maidens: Numeric;
  runs: Numeric;
  wickets: Numeric;
  overs: string | null;
  overs_decimal: Numeric;
}

export interface BestFiguresRow {
  wickets: Numeric;
  runs_conceded: Numeric;
}

export interface RecentInningsRow {
  match_id: string;
  source: string;
  start_date: string;
  format: string;
  opponent: string | null;
  runs: Numeric;
  balls_faced: Numeric;
  is_out: boolean | null;
}

const RECENT_INNINGS_LIMIT = 10;

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Batting) private readonly batting: Repository<Batting>,
    @InjectRepository(Bowling) private readonly bowling: Repository<Bowling>,
  ) {}

  findPlayer(playerId: string): Promise<PlayerRow | null> {
    return this.players
      .createQueryBuilder('p')
      .select('CAST(p.playerId AS text)', 'player_id')
      .addSelect('CAST(p.rowSource AS text)', 'source')
      .addSelect('p.fullName', 'full_name')
      .addSelect('p.knownAs', 'known_as')
      .addSelect('p.countryAlpha2', 'country_alpha2')
      .addSelect('CAST(p.bats AS text)', 'bats')
      .addSelect('CAST(p.bowls AS text)', 'bowls')
      .addSelect('p.bowlingStyles', 'bowling_styles')
      .addSelect('p.birthDate', 'birth_date')
      .addSelect('p.daftPlayerKey', 'daft_player_key')
      .addSelect('p.sofaId', 'sofa_id')
      .addSelect('(p.daft_player_key IS NOT NULL AND p.sofa_id IS NOT NULL)', 'identity_glued')
      .where('p.playerId = CAST(:playerId AS uuid)', { playerId })
      .getRawOne<PlayerRow>()
      .then((row) => row ?? null);
  }

  battingAggregate(playerId: string, format: MatchFormat | null): Promise<BattingAggregateRow> {
    const qb = this.scopedBatting(playerId, format)
      .select('count(*) FILTER (WHERE NOT b.did_not_bat)', 'innings')
      .addSelect('count(*) FILTER (WHERE b.is_out)', 'outs')
      .addSelect('coalesce(sum(b.runs) FILTER (WHERE NOT b.did_not_bat), 0)', 'runs')
      .addSelect(
        'coalesce(sum(b.balls_faced) FILTER (WHERE NOT b.did_not_bat), 0)',
        'balls_faced',
      )
      .addSelect(
        'coalesce(sum(b.runs) FILTER (WHERE b.balls_faced IS NOT NULL AND NOT b.did_not_bat), 0)',
        'runs_with_balls',
      )
      .addSelect(
        'count(*) FILTER (WHERE b.balls_faced IS NOT NULL AND NOT b.did_not_bat)',
        'innings_with_balls',
      )
      .addSelect('count(*) FILTER (WHERE b.runs >= 100 AND NOT b.did_not_bat)', 'hundreds')
      .addSelect(
        'count(*) FILTER (WHERE b.runs >= 50 AND b.runs < 100 AND NOT b.did_not_bat)',
        'fifties',
      )
      .addSelect('coalesce(sum(b.fours) FILTER (WHERE NOT b.did_not_bat), 0)', 'fours')
      .addSelect('coalesce(sum(b.sixes) FILTER (WHERE NOT b.did_not_bat), 0)', 'sixes');

    return this.withSourceCounts(qb).getRawOne<BattingAggregateRow>() as Promise<BattingAggregateRow>;
  }

  highestScore(playerId: string, format: MatchFormat | null): Promise<HighestScoreRow | null> {
    return this.scopedBatting(playerId, format)
      .select('b.runs', 'runs')
      .addSelect('b.isOut', 'is_out')
      .andWhere('NOT b.didNotBat')
      .andWhere('b.runs IS NOT NULL')
      .orderBy('b.runs', 'DESC')
      .addOrderBy('b.isOut', 'ASC')
      .limit(1)
      .getRawOne<HighestScoreRow>()
      .then((row) => row ?? null);
  }

  bowlingAggregate(playerId: string, format: MatchFormat | null): Promise<BowlingAggregateRow> {
    const qb = this.scopedBowling(playerId, format)
      .select('count(*)', 'innings')
      .addSelect('coalesce(sum(b.legal_balls), 0)', 'legal_balls')
      .addSelect('coalesce(sum(b.maidens), 0)', 'maidens')
      .addSelect('coalesce(sum(b.runs_conceded), 0)', 'runs')
      .addSelect('coalesce(sum(b.wickets), 0)', 'wickets')
      .addSelect(
        `CASE
           WHEN count(*) = 0 THEN NULL
           WHEN count(DISTINCT b.balls_per_over) = 1
             THEN cricket.overs_display(
               CAST(coalesce(sum(b.legal_balls), 0) AS int),
               min(b.balls_per_over)
             )
           ELSE CAST(
             round(sum(CAST(b.legal_balls AS numeric) / NULLIF(b.balls_per_over, 0)), 1)
             AS text
           )
         END`,
        'overs',
      )
      .addSelect(
        'sum(CAST(b.legal_balls AS numeric) / NULLIF(b.balls_per_over, 0))',
        'overs_decimal',
      );

    return this.withSourceCounts(qb).getRawOne<BowlingAggregateRow>() as Promise<BowlingAggregateRow>;
  }

  bestFigures(playerId: string, format: MatchFormat | null): Promise<BestFiguresRow | null> {
    return this.scopedBowling(playerId, format)
      .select('b.wickets', 'wickets')
      .addSelect('b.runsConceded', 'runs_conceded')
      .andWhere('b.wickets > 0')
      .orderBy('b.wickets', 'DESC')
      .addOrderBy('b.runsConceded', 'ASC')
      .limit(1)
      .getRawOne<BestFiguresRow>()
      .then((row) => row ?? null);
  }

  recentInnings(
    playerId: string,
    format: MatchFormat | null,
    limit = RECENT_INNINGS_LIMIT,
  ): Promise<RecentInningsRow[]> {
    return this.scopedBatting(playerId, format)
      .select('CAST(m.matchId AS text)', 'match_id')
      .addSelect('CAST(b.rowSource AS text)', 'source')
      .addSelect('m.startDate', 'start_date')
      .addSelect('CAST(m.format AS text)', 'format')
      .addSelect('b.runs', 'runs')
      .addSelect('b.ballsFaced', 'balls_faced')
      .addSelect('b.isOut', 'is_out')
      .addSelect(
        (sub) =>
          sub
            .select('opponentTeam.name')
            .from(MatchTeam, 'opponentSide')
            .innerJoin(Team, 'opponentTeam', 'opponentTeam.teamId = opponentSide.teamId')
            .where('opponentSide.matchId = m.match_id')
            .andWhere(
              '(i.batting_team_id IS NULL OR opponentSide.teamId <> i.batting_team_id)',
            )
            .orderBy('opponentSide.battingOrderSide')
            .limit(1),
        'opponent',
      )
      .andWhere('NOT b.didNotBat')
      .orderBy('m.startDate', 'DESC')
      .addOrderBy('i.inningsNumber', 'DESC')
      .limit(limit)
      .getRawMany<RecentInningsRow>();
  }

  /** `batting -> innings -> match`, optionally narrowed to one format. */
  private scopedBatting(
    playerId: string,
    format: MatchFormat | null,
  ): SelectQueryBuilder<Batting> {
    const qb = this.batting
      .createQueryBuilder('b')
      .innerJoin(Innings, 'i', 'i.inningsId = b.inningsId')
      .innerJoin(Match, 'm', 'm.matchId = i.matchId')
      .where('b.playerId = CAST(:playerId AS uuid)', { playerId });
    return this.withFormat(qb, format);
  }

  private scopedBowling(
    playerId: string,
    format: MatchFormat | null,
  ): SelectQueryBuilder<Bowling> {
    const qb = this.bowling
      .createQueryBuilder('b')
      .innerJoin(Innings, 'i', 'i.inningsId = b.inningsId')
      .innerJoin(Match, 'm', 'm.matchId = i.matchId')
      .where('b.playerId = CAST(:playerId AS uuid)', { playerId });
    return this.withFormat(qb, format);
  }

  /** Buckets the scanned rows by feed, so an aggregate reports its own source mix. */
  private withSourceCounts<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> {
    for (const [expression, alias] of sourceCountSelects('b.row_source')) {
      qb.addSelect(expression, alias);
    }
    return qb;
  }

  private withFormat<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    format: MatchFormat | null,
  ): SelectQueryBuilder<T> {
    return format ? qb.andWhere('m.format = CAST(:format AS cricket.match_format)', { format }) : qb;
  }
}
