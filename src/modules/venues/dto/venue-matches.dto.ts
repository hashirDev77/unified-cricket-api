import { ApiProperty } from '@nestjs/swagger';
import { AppliedFiltersDto } from 'src/common/dto/applied-filters.dto';
import { MatchSummaryDto } from 'src/common/dto/match-summary.dto';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class VenueDetailDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  city: string | null;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty({ nullable: true, type: Number })
  capacity: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({ description: 'Every match at this venue, ignoring the query filters.' })
  total_matches: number;
}

export class VenueFiltersDto extends AppliedFiltersDto {
  @ApiProperty({ nullable: true, type: String, description: 'Resolved match uuid.' })
  match_id: string | null;
}

export class VenueMatchesDto {
  @ApiProperty({ type: VenueDetailDto })
  venue: VenueDetailDto;

  @ApiProperty({ type: VenueFiltersDto })
  filters: VenueFiltersDto;

  @ApiProperty({ description: 'Length of `matches`, which `limit` caps.' })
  count: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;

  @ApiProperty({ type: [MatchSummaryDto], description: 'Most recent first.' })
  matches: MatchSummaryDto[];
}
