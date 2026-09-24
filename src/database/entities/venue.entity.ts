import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSystem } from '../enums/cricket.enums';

@Entity({ schema: 'cricket', name: 'venue' })
export class Venue {
  @PrimaryGeneratedColumn('uuid', { name: 'venue_id' })
  venueId: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  city: string | null;

  @Column('text', { nullable: true })
  country: string | null;

  @Column('integer', { nullable: true })
  capacity: number | null;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('enum', { name: 'row_source', enum: SourceSystem, enumName: 'source_system' })
  rowSource: SourceSystem;
}
