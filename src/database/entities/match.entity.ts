import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  Gender,
  MatchFormat,
  MatchStatus,
  ResultType,
  SourceSystem,
  TossDecision,
  WinMarginUnit,
} from '../enums/cricket.enums';
import { Competition } from './competition.entity';
import { Team } from './team.entity';
import { Venue } from './venue.entity';

@Entity({ schema: 'cricket', name: 'match' })
export class Match {
  @PrimaryGeneratedColumn('uuid', { name: 'match_id' })
  matchId: string;

  @Column('uuid', { name: 'competition_id', nullable: true })
  competitionId: string | null;

  @Column('uuid', { name: 'season_id', nullable: true })
  seasonId: string | null;

  @Column('uuid', { name: 'venue_id', nullable: true })
  venueId: string | null;

  @Column('uuid', { name: 'home_team_id', nullable: true })
  homeTeamId: string | null;

  @Column('uuid', { name: 'away_team_id', nullable: true })
  awayTeamId: string | null;

  @Column('uuid', { name: 'toss_winner_id', nullable: true })
  tossWinnerId: string | null;

  @Column('enum', {
    name: 'toss_decision',
    enum: TossDecision,
    enumName: 'toss_decision',
    nullable: true,
  })
  tossDecision: TossDecision | null;

  @Column('uuid', { name: 'winner_team_id', nullable: true })
  winnerTeamId: string | null;

  @Column('date', { name: 'start_date' })
  startDate: string;

  @Column('timestamptz', { name: 'start_time', nullable: true })
  startTime: Date | null;

  @Column('date', { name: 'end_date', nullable: true })
  endDate: string | null;

  @Column('enum', { enum: Gender, enumName: 'gender' })
  gender: Gender;

  @Column('enum', { enum: MatchFormat, enumName: 'match_format' })
  format: MatchFormat;

  @Column('enum', { enum: MatchStatus, enumName: 'match_status' })
  status: MatchStatus;

  @Column('enum', {
    name: 'result_type',
    enum: ResultType,
    enumName: 'result_type',
    nullable: true,
  })
  resultType: ResultType | null;

  @Column('integer', { name: 'win_margin', nullable: true })
  winMargin: number | null;

  @Column('enum', {
    name: 'win_margin_unit',
    enum: WinMarginUnit,
    enumName: 'win_margin_unit',
    nullable: true,
  })
  winMarginUnit: WinMarginUnit | null;

  @Column('smallint', { name: 'balls_per_over' })
  ballsPerOver: number;

  @Column('boolean', { name: 'has_scorecard' })
  hasScorecard: boolean;

  @Column('boolean', { name: 'has_deliveries' })
  hasDeliveries: boolean;

  @Column('boolean', { name: 'has_partnerships' })
  hasPartnerships: boolean;

  @Column('boolean', { name: 'has_lineup' })
  hasLineup: boolean;

  @Column('boolean', { name: 'has_odds' })
  hasOdds: boolean;

  @Column('boolean', { name: 'has_cop' })
  hasCop: boolean;

  @Column('enum', {
    name: 'scorecard_source',
    enum: SourceSystem,
    enumName: 'source_system',
    nullable: true,
  })
  scorecardSource: SourceSystem | null;

  @Column('enum', {
    name: 'live_source',
    enum: SourceSystem,
    enumName: 'source_system',
    nullable: true,
  })
  liveSource: SourceSystem | null;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('text', { name: 'daft_match_id', nullable: true })
  daftMatchId: string | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Competition, { nullable: true })
  @JoinColumn({ name: 'competition_id' })
  competition: Competition | null;

  @ManyToOne(() => Venue, { nullable: true })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'toss_winner_id' })
  tossWinner: Team | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'winner_team_id' })
  winnerTeam: Team | null;
}
