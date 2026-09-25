import { ApiProperty } from '@nestjs/swagger';
import { AppliedFiltersDto } from 'src/common/dto/applied-filters.dto';
import { MatchSummaryDto } from 'src/common/dto/match-summary.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class MatchSearchFiltersDto extends AppliedFiltersDto {
  @ApiProperty({ nullable: true, type: String, description: 'Venue country.' })
  country: string | null;
}

export class MatchListDto {
  @ApiProperty({ type: MatchSearchFiltersDto })
  filters: MatchSearchFiltersDto;

  @ApiProperty({ description: 'Length of `matches`, which `limit` caps.' })
  count: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;

  @ApiProperty({ type: [MatchSummaryDto], description: 'Most recent first.' })
  matches: MatchSummaryDto[];
}
