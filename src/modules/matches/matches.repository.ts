import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import {
  Batting,
  Bowling,
  Competition,
  Innings,
  Match,
  MatchAward,
  MatchTeam,
  Player,
  Team,
  Venue,
} from 'src/database/entities';
import { SourceSystem } from 'src/database/enums/cricket.enums';
import { Repository } from 'typeorm';

export interface MatchHeaderRow {
  match_id: string;
  source: string;
  daft_match_id: string | null;
  sofa_id: number | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  format: string;
  gender: string;
  status: string;
  result_type: string | null;
  win_margin: Numeric;
  win_margin_unit: string | null;
  toss_decision: string | null;
  scorecard_source: SourceSystem | null;
  has_scorecard: boolean;
  has_deliveries: boolean;
  has_odds: boolean;
  has_partnerships: boolean;
  has_lineup: boolean;
  competition_id: string | null;
  competition_name: string | null;
  competition_source: string | null;
  venue_id: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_country: string | null;
  venue_source: string | null;
  toss_winner_id: string | null;
  toss_winner: string | null;
  winner_id: string | null;
  winner: string | null;
}

export interface MatchTeamRow {
  id: string;
  name: string;
  source: string;
  batting_order_side: number;
  is_home: boolean | null;
}

export interface InningsRow {
  innings_id: string;
  source: string;
  innings_number: number;
  runs: Numeric;
  wickets: Numeric;
  declared: boolean | null;
  is_follow_on: boolean;
  target: Numeric;
  byes: Numeric;
  leg_byes: Numeric;
  wides: Numeric;
  no_balls: Numeric;
  penalties: Numeric;
  batting_team_id: string | null;
  batting_team: string | null;
  bowling_team_id: string | null;
  bowling_team: string | null;
  overs: string | null;
}

export interface BattingRow {
  innings_id: string;
  source: string;
  player_id: string;
  name: string;
  batting_position: Numeric;
  runs: Numeric;
  balls_faced: Numeric;
  fours: Numeric;
  sixes: Numeric;
  is_out: boolean | null;
  dismissal_type: string | null;
  did_not_bat: boolean;
  bowler: string | null;
  fielder: string | null;
}

export interface BowlingRow {
  innings_id: string;
  source: string;
  player_id: string;
  name: string;
  bowling_position: Numeric;
  legal_balls: Numeric;
  balls_per_over: Numeric;
  overs_display: string | null;
  maidens: Numeric;
  runs_conceded: Numeric;
  wickets: Numeric;
  wides: Numeric;
  no_balls: Numeric;
}

export interface AwardRow {
  award_type: string;
  award_rank: number;
  source: string;
  player_id: string | null;
  player: string | null;
  team: string | null;
}

@Injectable()
export class MatchesRepository {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Innings) private readonly innings: Repository<Innings>,
    @InjectRepository(Batting) private readonly batting: Repository<Batting>,
    @InjectRepository(Bowling) private readonly bowling: Repository<Bowling>,
    @InjectRepository(MatchTeam) private readonly matchTeams: Repository<MatchTeam>,
    @InjectRepository(MatchAward) private readonly awards: Repository<MatchAward>,
  ) {}

  findHeader(matchId: string): Promise<MatchHeaderRow | null> {
    return this.matches
      .createQueryBuilder('m')
      .select('CAST(m.matchId AS text)', 'match_id')
      .addSelect('CAST(m.rowSource AS text)', 'source')
      .addSelect('m.daftMatchId', 'daft_match_id')
      .addSelect('m.sofaId', 'sofa_id')
      .addSelect('m.startDate', 'start_date')
      .addSelect('m.startTime', 'start_time')
      .addSelect('m.endDate', 'end_date')
      .addSelect('CAST(m.format AS text)', 'format')
      .addSelect('CAST(m.gender AS text)', 'gender')
      .addSelect('CAST(m.status AS text)', 'status')
      .addSelect('CAST(m.resultType AS text)', 'result_type')
      .addSelect('m.winMargin', 'win_margin')
      .addSelect('CAST(m.winMarginUnit AS text)', 'win_margin_unit')
      .addSelect('CAST(m.tossDecision AS text)', 'toss_decision')
      .addSelect('CAST(m.scorecardSource AS text)', 'scorecard_source')
      .addSelect('m.hasScorecard', 'has_scorecard')
      .addSelect('m.hasDeliveries', 'has_deliveries')
      .addSelect('m.hasOdds', 'has_odds')
      .addSelect('m.hasPartnerships', 'has_partnerships')
      .addSelect('m.hasLineup', 'has_lineup')
      .addSelect('CAST(c.competitionId AS text)', 'competition_id')
      .addSelect('c.name', 'competition_name')
      .addSelect('CAST(c.rowSource AS text)', 'competition_source')
      .addSelect('CAST(v.venueId AS text)', 'venue_id')
      .addSelect('v.name', 'venue_name')
      .addSelect('v.city', 'venue_city')
      .addSelect('v.country', 'venue_country')
      .addSelect('CAST(v.rowSource AS text)', 'venue_source')
      .addSelect('CAST(tossWinner.teamId AS text)', 'toss_winner_id')
      .addSelect('tossWinner.name', 'toss_winner')
      .addSelect('CAST(winner.teamId AS text)', 'winner_id')
      .addSelect('winner.name', 'winner')
      .leftJoin(Competition, 'c', 'c.competitionId = m.competitionId')
      .leftJoin(Venue, 'v', 'v.venueId = m.venueId')
      .leftJoin(Team, 'tossWinner', 'tossWinner.teamId = m.tossWinnerId')
      .leftJoin(Team, 'winner', 'winner.teamId = m.winnerTeamId')
      .where('m.matchId = CAST(:matchId AS uuid)', { matchId })
      .getRawOne<MatchHeaderRow>()
      .then((row) => row ?? null);
  }

  findTeams(matchId: string): Promise<MatchTeamRow[]> {
    return this.matchTeams
      .createQueryBuilder('mt')
      .select('CAST(t.teamId AS text)', 'id')
      .addSelect('t.name', 'name')
      .addSelect('CAST(t.rowSource AS text)', 'source')
      .addSelect('mt.battingOrderSide', 'batting_order_side')
      .addSelect('mt.isHome', 'is_home')
      .innerJoin(Team, 't', 't.teamId = mt.teamId')
      .where('mt.matchId = CAST(:matchId AS uuid)', { matchId })
      .orderBy('mt.battingOrderSide')
      .getRawMany<MatchTeamRow>();
  }

  findInnings(matchId: string, source: SourceSystem): Promise<InningsRow[]> {
    return this.innings
      .createQueryBuilder('i')
      .select('CAST(i.inningsId AS text)', 'innings_id')
      .addSelect('CAST(i.rowSource AS text)', 'source')
      .addSelect('i.inningsNumber', 'innings_number')
      .addSelect('i.runs', 'runs')
      .addSelect('i.wickets', 'wickets')
      .addSelect('i.declared', 'declared')
      .addSelect('i.isFollowOn', 'is_follow_on')
      .addSelect('i.target', 'target')
      .addSelect('i.byes', 'byes')
      .addSelect('i.legByes', 'leg_byes')
      .addSelect('i.wides', 'wides')
      .addSelect('i.noBalls', 'no_balls')
      .addSelect('i.penalties', 'penalties')
      .addSelect('CAST(battingTeam.teamId AS text)', 'batting_team_id')
      .addSelect('battingTeam.name', 'batting_team')
      .addSelect('CAST(bowlingTeam.teamId AS text)', 'bowling_team_id')
      .addSelect('bowlingTeam.name', 'bowling_team')
      .addSelect(
        (sub) =>
          sub
            .select(
              `CASE
                 WHEN count(*) = 0 THEN NULL
                 WHEN count(DISTINCT figures.ballsPerOver) = 1
                   THEN cricket.overs_display(
                     CAST(coalesce(sum(figures.legalBalls), 0) AS int),
                     min(figures.ballsPerOver)
                   )
                 ELSE CAST(
                   round(sum(CAST(figures.legalBalls AS numeric) / NULLIF(figures.ballsPerOver, 0)), 1)
                   AS text
                 )
               END`,
            )
            .from(Bowling, 'figures')
            .where('figures.inningsId = i.innings_id')
            .andWhere('figures.rowSource = CAST(:source AS cricket.source_system)'),
        'overs',
      )
      .leftJoin(Team, 'battingTeam', 'battingTeam.teamId = i.battingTeamId')
      .leftJoin(Team, 'bowlingTeam', 'bowlingTeam.teamId = i.bowlingTeamId')
      .where('i.matchId = CAST(:matchId AS uuid)')
      .setParameters({ matchId, source })
      .orderBy('i.inningsNumber')
      .getRawMany<InningsRow>();
  }

  findBatting(matchId: string, source: SourceSystem): Promise<BattingRow[]> {
    return this.batting
      .createQueryBuilder('b')
      .select('CAST(i.inningsId AS text)', 'innings_id')
      .addSelect('CAST(p.playerId AS text)', 'player_id')
      .addSelect('p.fullName', 'name')
      .addSelect('CAST(b.rowSource AS text)', 'source')
      .addSelect('b.battingPosition', 'batting_position')
      .addSelect('b.runs', 'runs')
      .addSelect('b.ballsFaced', 'balls_faced')
      .addSelect('b.fours', 'fours')
      .addSelect('b.sixes', 'sixes')
      .addSelect('b.isOut', 'is_out')
      .addSelect('b.dismissalType', 'dismissal_type')
      .addSelect('b.didNotBat', 'did_not_bat')
      .addSelect('bowlerPlayer.fullName', 'bowler')
      .addSelect('fielderPlayer.fullName', 'fielder')
      .innerJoin(Innings, 'i', 'i.inningsId = b.inningsId')
      .innerJoin(Player, 'p', 'p.playerId = b.playerId')
      .leftJoin(Player, 'bowlerPlayer', 'bowlerPlayer.playerId = b.bowlerId')
      .leftJoin(Player, 'fielderPlayer', 'fielderPlayer.playerId = b.fielderId')
      .where('i.matchId = CAST(:matchId AS uuid)')
      .andWhere('b.rowSource = CAST(:source AS cricket.source_system)')
      .setParameters({ matchId, source })
      .orderBy('i.inningsNumber')
      .addOrderBy('b.battingPosition', 'ASC', 'NULLS LAST')
      .addOrderBy('p.fullName')
      .getRawMany<BattingRow>();
  }

  findBowling(matchId: string, source: SourceSystem): Promise<BowlingRow[]> {
    return this.bowling
      .createQueryBuilder('b')
      .select('CAST(i.inningsId AS text)', 'innings_id')
      .addSelect('CAST(p.playerId AS text)', 'player_id')
      .addSelect('p.fullName', 'name')
      .addSelect('CAST(b.rowSource AS text)', 'source')
      .addSelect('b.bowlingPosition', 'bowling_position')
      .addSelect('b.legalBalls', 'legal_balls')
      .addSelect('b.ballsPerOver', 'balls_per_over')
      .addSelect('b.oversDisplay', 'overs_display')
      .addSelect('b.maidens', 'maidens')
      .addSelect('b.runsConceded', 'runs_conceded')
      .addSelect('b.wickets', 'wickets')
      .addSelect('b.wides', 'wides')
      .addSelect('b.noBalls', 'no_balls')
      .innerJoin(Innings, 'i', 'i.inningsId = b.inningsId')
      .innerJoin(Player, 'p', 'p.playerId = b.playerId')
      .where('i.matchId = CAST(:matchId AS uuid)')
      .andWhere('b.rowSource = CAST(:source AS cricket.source_system)')
      .setParameters({ matchId, source })
      .orderBy('i.inningsNumber')
      .addOrderBy('b.bowlingPosition', 'ASC', 'NULLS LAST')
      .addOrderBy('p.fullName')
      .getRawMany<BowlingRow>();
  }

  findAwards(matchId: string): Promise<AwardRow[]> {
    return this.awards
      .createQueryBuilder('a')
      .select('a.awardType', 'award_type')
      .addSelect('a.awardRank', 'award_rank')
      .addSelect('CAST(a.rowSource AS text)', 'source')
      .addSelect('CAST(p.playerId AS text)', 'player_id')
      .addSelect('p.fullName', 'player')
      .addSelect('t.name', 'team')
      .leftJoin(Player, 'p', 'p.playerId = a.playerId')
      .leftJoin(Team, 't', 't.teamId = a.teamId')
      .where('a.matchId = CAST(:matchId AS uuid)', { matchId })
      .orderBy('a.awardRank')
      .addOrderBy('a.awardType')
      .getRawMany<AwardRow>();
  }
}
