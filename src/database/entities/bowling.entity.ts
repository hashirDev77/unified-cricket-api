import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Innings } from './innings.entity';
import { Player } from './player.entity';

@Entity({ schema: 'cricket', name: 'bowling' })
export class Bowling {
  @PrimaryGeneratedColumn('uuid', { name: 'bowling_id' })
  bowlingId: string;

  @Column('uuid', { name: 'innings_id' })
  inningsId: string;

  @Column('uuid', { name: 'player_id' })
  playerId: string;

  @Column('smallint', { name: 'bowling_position', nullable: true })
  bowlingPosition: number | null;

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

  @Column('smallint', { nullable: true })
  maidens: number | null;

  @Column('integer', { name: 'runs_conceded', nullable: true })
  runsConceded: number | null;

  @Column('smallint', { nullable: true })
  wickets: number | null;

  @Column('smallint', { nullable: true })
  wides: number | null;

  @Column('smallint', { name: 'no_balls', nullable: true })
  noBalls: number | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Innings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'innings_id' })
  innings: Innings;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
