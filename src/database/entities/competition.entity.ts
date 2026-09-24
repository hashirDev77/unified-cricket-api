import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender, MatchFormat, SourceSystem } from '../enums/cricket.enums';

@Entity({ schema: 'cricket', name: 'competition' })
export class Competition {
  @PrimaryGeneratedColumn('uuid', { name: 'competition_id' })
  competitionId: string;

  @Column('text')
  name: string;

  @Column('text', { name: 'short_name', nullable: true })
  shortName: string | null;

  @Column('enum', { enum: Gender, enumName: 'gender' })
  gender: Gender;

  @Column('enum', { enum: MatchFormat, enumName: 'match_format' })
  format: MatchFormat;

  @Column('text', { nullable: true })
  country: string | null;

  @Column('boolean', { name: 'is_international' })
  isInternational: boolean;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;
}
