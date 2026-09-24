import { Injectable } from '@nestjs/common';
import { toInt, toIntOrZero } from 'src/common/formatting/numbers';
import { VENUE_MATCHES_NOTE } from 'src/common/provenance/notes';
import { sourceRef, summarise } from 'src/common/provenance/source.util';
import { IdentityService } from 'src/modules/identity/identity.service';
import { MatchListService } from 'src/modules/match-list/match-list.service';
import { VenueMatchesQueryDto } from './dto/venue-matches-query.dto';
import { VenueDetailDto, VenueMatchesDto } from './dto/venue-matches.dto';
import { VenueRow, VenuesRepository } from './venues.repository';

const VENUE_MATCH_LIMIT = 20;

@Injectable()
export class VenuesService {
  constructor(
    private readonly repository: VenuesRepository,
    private readonly identity: IdentityService,
    private readonly matchList: MatchListService,
  ) {}

  async findMatches(
    venueKey: string,
    query: VenueMatchesQueryDto,
  ): Promise<VenueMatchesDto | null> {
    const venue = await this.repository.findVenue(venueKey);
    if (!venue) return null;

    const format = query.format ?? null;
    const matchId = query.match_id ? await this.identity.resolveMatch(query.match_id) : null;
    const filters = { format, match_id: matchId };

    // An unresolvable match id filters everything out rather than 404ing the venue.
    const matches =
      query.match_id && !matchId
        ? []
        : await this.matchList.findMatches({
            venueId: venue.id,
            matchId,
            format,
            limit: query.limit ?? VENUE_MATCH_LIMIT,
          });

    return {
      venue: this.toVenue(venue),
      filters,
      count: matches.length,
      sources: summarise([venue, ...matches], VENUE_MATCHES_NOTE),
      matches,
    };
  }

  private toVenue(row: VenueRow): VenueDetailDto {
    return {
      id: row.id,
      ...sourceRef(row.source),
      name: row.name,
      city: row.city,
      country: row.country,
      capacity: toInt(row.capacity),
      sofa_id: toInt(row.sofa_id),
      total_matches: toIntOrZero(row.total_matches),
    };
  }
}
