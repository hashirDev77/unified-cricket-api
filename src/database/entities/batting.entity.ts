import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Innings } from './innings.entity';
import { Player } from './player.entity';

@Entity({ schema: 'cricket', name: 'batting' })
export class Batting {
  @PrimaryGeneratedColumn('uuid', { name: 'batting_id' })
  battingId: string;

  @Column('uuid', { name: 'innings_id' })
  inningsId: string;

  @Column('uuid', { name: 'player_id' })
  playerId: string;

  @Column('smallint', { name: 'batting_position', nullable: true })
  battingPosition: number | null;

  @Column('integer', { nullable: true })
  runs: number | null;

  @Column('integer', { name: 'balls_faced', nullable: true })
  ballsFaced: number | null;

  @Column('smallint', { nullable: true })
  fours: number | null;

  @Column('smallint', { nullable: true })
  sixes: number | null;

  @Column('boolean', { name: 'is_out', nullable: true })
  isOut: boolean | null;

  @Column('text', { name: 'dismissal_type', nullable: true })
  dismissalType: string | null;

  @Column('uuid', { name: 'bowler_id', nullable: true })
  bowlerId: string | null;

  @Column('uuid', { name: 'fielder_id', nullable: true })
  fielderId: string | null;

  @Column('boolean', { name: 'did_not_bat' })
  didNotBat: boolean;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Innings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'innings_id' })
  innings: Innings;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'bowler_id' })
  bowler: Player | null;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'fielder_id' })
  fielder: Player | null;
}
