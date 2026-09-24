import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender, SourceSystem } from '../enums/cricket.enums';

@Entity({ schema: 'cricket', name: 'team' })
export class Team {
  @PrimaryGeneratedColumn('uuid', { name: 'team_id' })
  teamId: string;

  @Column('text')
  name: string;

  @Column('text', { name: 'short_name', nullable: true })
  shortName: string | null;

  @Column('enum', { enum: Gender, enumName: 'gender', nullable: true })
  gender: Gender | null;

  @Column('text', { nullable: true })
  country: string | null;

  @Column('boolean', { name: 'is_national', nullable: true })
  isNational: boolean | null;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;
}
