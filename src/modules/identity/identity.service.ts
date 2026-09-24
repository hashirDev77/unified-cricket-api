import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUuid, toSofaId } from 'src/common/sql/query.util';
import { Match, Player, Team } from 'src/database/entities';
import { ObjectLiteral, Repository } from 'typeorm';

interface KeyColumns {
  /** Entity property holding the canonical uuid. */
  id: string;
  /** Entity property holding the source-specific text key, if the table has one. */
  daft?: string;
}

/**
 * Public ids come in three shapes: canonical uuid, SofaScore integer id, or the
 * source text key. Resolution always returns the canonical uuid.
 */
@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
  ) {}

  resolveMatch(key: string): Promise<string | null> {
    return this.resolve(this.matches, 'm', key, { id: 'matchId', daft: 'daftMatchId' });
  }

  resolvePlayer(key: string): Promise<string | null> {
    return this.resolve(this.players, 'p', key, { id: 'playerId', daft: 'daftPlayerKey' });
  }

  resolveTeam(key: string): Promise<string | null> {
    return this.resolve(this.teams, 't', key, { id: 'teamId' });
  }

  private async resolve<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    key: string,
    columns: KeyColumns,
  ): Promise<string | null> {
    const trimmed = key.trim();
    const qb = repository
      .createQueryBuilder(alias)
      .select(`CAST(${alias}.${columns.id} AS text)`, 'id')
      .limit(1);

    if (isUuid(trimmed)) {
      qb.where(`${alias}.${columns.id} = CAST(:key AS uuid)`, { key: trimmed });
    } else if (/^\d+$/.test(trimmed)) {
      const sofaId = toSofaId(trimmed);
      if (sofaId === null) return null;
      qb.where(`${alias}.sofaId = :key`, { key: sofaId });
    } else if (columns.daft) {
      qb.where(`${alias}.${columns.daft} = :key`, { key: trimmed });
    } else {
      return null;
    }

    const row = await qb.getRawOne<{ id: string }>();
    return row?.id ?? null;
  }
}
