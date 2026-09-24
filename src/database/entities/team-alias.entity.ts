import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceOnly } from '../enums/cricket.enums';
import { Team } from './team.entity';

@Entity({ schema: 'cricket', name: 'team_alias' })
export class TeamAlias {
  @PrimaryGeneratedColumn('uuid', { name: 'alias_id' })
  aliasId: string;

  @Column('uuid', { name: 'team_id' })
  teamId: string;

  @Column('text', { name: 'alias_name' })
  aliasName: string;

  @Column('enum', { enum: SourceOnly, enumName: 'source_only', nullable: true })
  source: SourceOnly | null;

  @Column('boolean', { name: 'is_franchise_rename' })
  isFranchiseRename: boolean;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
