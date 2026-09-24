import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { isUuid, toSofaId } from 'src/common/sql/query.util';
import { Match, Venue } from 'src/database/entities';
import { Repository } from 'typeorm';

export interface VenueRow {
  id: string;
  source: string;
  name: string;
  city: string | null;
  country: string | null;
  capacity: Numeric;
  sofa_id: Numeric;
  total_matches: Numeric;
}

@Injectable()
export class VenuesRepository {
  constructor(@InjectRepository(Venue) private readonly venues: Repository<Venue>) {}

  /** Accepts a uuid, a SofaScore id or a venue name; names repeat, so the busiest ground wins. */
  async findVenue(key: string): Promise<VenueRow | null> {
    const trimmed = key.trim();
    const qb = this.venues
      .createQueryBuilder('v')
      .select('CAST(v.venueId AS text)', 'id')
      .addSelect('CAST(v.rowSource AS text)', 'source')
      .addSelect('v.name', 'name')
      .addSelect('v.city', 'city')
      .addSelect('v.country', 'country')
      .addSelect('v.capacity', 'capacity')
      .addSelect('v.sofaId', 'sofa_id')
      .addSelect(
        (sub) => sub.select('count(*)').from(Match, 'vm').where('vm.venueId = v.venue_id'),
        'total_matches',
      )
      .orderBy('total_matches', 'DESC')
      .addOrderBy('v.venueId')
      .limit(1);

    if (isUuid(trimmed)) {
      qb.where('v.venueId = CAST(:key AS uuid)', { key: trimmed });
    } else if (/^\d+$/.test(trimmed)) {
      const sofaId = toSofaId(trimmed);
      if (sofaId === null) return null;
      qb.where('v.sofaId = :key', { key: sofaId });
    } else {
      qb.where('lower(v.name) = lower(:key)', { key: trimmed });
    }

    return (await qb.getRawOne<VenueRow>()) ?? null;
  }
}
