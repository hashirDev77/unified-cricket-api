import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Match } from './match.entity';
import { Team } from './team.entity';

@Entity({ schema: 'cricket', name: 'innings' })
export class Innings {
  @PrimaryGeneratedColumn('uuid', { name: 'innings_id' })
  inningsId: string;

  @Column('uuid', { name: 'match_id' })
  matchId: string;

  @Column('smallint', { name: 'innings_number' })
  inningsNumber: number;

  @Column('uuid', { name: 'batting_team_id', nullable: true })
  battingTeamId: string | null;

  @Column('uuid', { name: 'bowling_team_id', nullable: true })
  bowlingTeamId: string | null;

  @Column('boolean', { name: 'is_follow_on' })
  isFollowOn: boolean;

  @Column('integer', { nullable: true })
  runs: number | null;

  @Column('smallint', { nullable: true })
  wickets: number | null;

  @Column('integer', { name: 'legal_balls', nullable: true })
  legalBalls: number | null;

  @Column('smallint', { name: 'balls_per_over' })
  ballsPerOver: number;

  @Column({
    type: 'text',
    name: 'overs_display',
    nullable: true,
    generatedType: 'STORED',
    asExpression: 'cricket.overs_display(legal_balls, balls_per_over)',
  })
  oversDisplay: string | null;

  @Column('boolean', { nullable: true })
  declared: boolean | null;

  @Column('boolean', { name: 'did_bat' })
  didBat: boolean;

  @Column('smallint', { nullable: true })
  wides: number | null;

  @Column('smallint', { name: 'no_balls', nullable: true })
  noBalls: number | null;

  @Column('smallint', { nullable: true })
  byes: number | null;

  @Column('smallint', { name: 'leg_byes', nullable: true })
  legByes: number | null;

  @Column('smallint', { nullable: true })
  penalties: number | null;

  @Column('integer', { nullable: true })
  target: number | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'batting_team_id' })
  battingTeam: Team | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'bowling_team_id' })
  bowlingTeam: Team | null;
}
