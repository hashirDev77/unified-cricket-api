import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceOnly } from '../enums/cricket.enums';
import { Player } from './player.entity';

@Entity({ schema: 'cricket', name: 'player_alias' })
export class PlayerAlias {
  @PrimaryGeneratedColumn('uuid', { name: 'alias_id' })
  aliasId: string;

  @Column('uuid', { name: 'player_id' })
  playerId: string;

  @Column('text', { name: 'alias_name', nullable: true })
  aliasName: string | null;

  @Column('integer', { name: 'sofa_id', nullable: true })
  sofaId: number | null;

  @Column('enum', { enum: SourceOnly, enumName: 'source_only' })
  source: SourceOnly;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
