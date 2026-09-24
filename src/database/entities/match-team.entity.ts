import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';
import { Match } from './match.entity';
import { Team } from './team.entity';

@Entity({ schema: 'cricket', name: 'match_team' })
export class MatchTeam {
  @PrimaryGeneratedColumn('uuid', { name: 'match_team_id' })
  matchTeamId: string;

  @Column('uuid', { name: 'match_id' })
  matchId: string;

  @Column('uuid', { name: 'team_id' })
  teamId: string;

  @Column('smallint', { name: 'batting_order_side' })
  battingOrderSide: number;

  @Column('boolean', { name: 'is_home', nullable: true })
  isHome: boolean | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
