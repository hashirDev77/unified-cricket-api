import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Match } from './match.entity';
import { Player } from './player.entity';
import { Team } from './team.entity';

@Entity({ schema: 'cricket', name: 'match_award' })
export class MatchAward {
  @PrimaryGeneratedColumn('uuid', { name: 'match_award_id' })
  matchAwardId: string;

  @Column('uuid', { name: 'match_id' })
  matchId: string;

  @Column('uuid', { name: 'player_id', nullable: true })
  playerId: string | null;

  @Column('uuid', { name: 'team_id', nullable: true })
  teamId: string | null;

  @Column('text', { name: 'award_type' })
  awardType: string;

  @Column('smallint', { name: 'award_rank' })
  awardRank: number;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'player_id' })
  player: Player | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team | null;
}
