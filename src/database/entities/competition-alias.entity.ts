import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceOnly } from '../enums/cricket.enums';
import { Competition } from './competition.entity';

@Entity({ schema: 'cricket', name: 'competition_alias' })
export class CompetitionAlias {
  @PrimaryGeneratedColumn('uuid', { name: 'alias_id' })
  aliasId: string;

  @Column('uuid', { name: 'competition_id' })
  competitionId: string;

  @Column('text', { name: 'alias_name' })
  aliasName: string;

  @Column('enum', { enum: SourceOnly, enumName: 'source_only' })
  source: SourceOnly;

  @ManyToOne(() => Competition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competition_id' })
  competition: Competition;
}
