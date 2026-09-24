import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Innings } from './innings.entity';
import { Player } from './player.entity';
import { Team } from './team.entity';

@Entity({ schema: 'cricket', name: 'delivery' })
export class Delivery {
  @PrimaryGeneratedColumn('uuid', { name: 'delivery_id' })
  deliveryId: string;

  @Column('uuid', { name: 'innings_id' })
  inningsId: string;

  @Column('smallint', { name: 'over_number' })
  overNumber: number;

  @Column('smallint', { name: 'ball_in_over' })
  ballInOver: number;

  @Column('integer', { name: 'delivery_index' })
  deliveryIndex: number;

  @Column('uuid', { name: 'batsman_id', nullable: true })
  batsmanId: string | null;

  @Column('uuid', { name: 'bowler_id', nullable: true })
  bowlerId: string | null;

  @Column('uuid', { name: 'batting_team_id', nullable: true })
  battingTeamId: string | null;

  @Column('uuid', { name: 'dismissed_id', nullable: true })
  dismissedId: string | null;

  @Column('smallint', { name: 'runs_off_bat', nullable: true })
  runsOffBat: number | null;

  @Column('smallint', { name: 'total_runs', nullable: true })
  totalRuns: number | null;

  @Column('boolean', { name: 'is_wicket', nullable: true })
  isWicket: boolean | null;

  @Column('text', { name: 'dismissal_type', nullable: true })
  dismissalType: string | null;

  @Column('text', { name: 'incident_class', nullable: true })
  incidentClass: string | null;

  @Column('text', { name: 'incident_class_label', nullable: true })
  incidentClassLabel: string | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Innings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'innings_id' })
  innings: Innings;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'batsman_id' })
  batsman: Player | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'bowler_id' })
  bowler: Player | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'batting_team_id' })
  battingTeam: Team | null;
}
