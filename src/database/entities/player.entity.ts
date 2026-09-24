import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  Hand,
  ResolutionConfidence,
  ResolutionMethod,
  SourceSystem,
} from '../enums/cricket.enums';

@Entity({ schema: 'cricket', name: 'player' })
export class Player {
  @PrimaryGeneratedColumn('uuid', { name: 'player_id' })
  playerId: string;

  @Column('text', { name: 'full_name' })
  fullName: string;

  @Column('text', { name: 'known_as', nullable: true })
  knownAs: string | null;

  @Column('text', { name: 'daft_player_key', nullable: true })
  daftPlayerKey: string | null;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('date', { name: 'birth_date', nullable: true })
  birthDate: string | null;

  @Column('date', { name: 'death_date', nullable: true })
  deathDate: string | null;

  @Column('char', { name: 'country_alpha2', length: 2, nullable: true })
  countryAlpha2: string | null;

  @Column('enum', { enum: Hand, enumName: 'hand', nullable: true })
  bats: Hand | null;

  @Column('enum', { enum: Hand, enumName: 'hand', nullable: true })
  bowls: Hand | null;

  @Column('text', { name: 'bowling_styles', array: true, nullable: true })
  bowlingStyles: string[] | null;

  @Column('enum', {
    name: 'identity_method',
    enum: ResolutionMethod,
    enumName: 'resolution_method',
    nullable: true,
  })
  identityMethod: ResolutionMethod | null;

  @Column('enum', {
    name: 'identity_confidence',
    enum: ResolutionConfidence,
    enumName: 'resolution_confidence',
    nullable: true,
  })
  identityConfidence: ResolutionConfidence | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;
}
