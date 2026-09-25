import { ApiProperty } from '@nestjs/swagger';
import { AppliedFiltersDto } from 'src/common/dto/applied-filters.dto';
import { MatchSummaryDto } from 'src/common/dto/match-summary.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { HeadToHeadDto } from 'src/modules/records/dto/records.dto';

export class TeamHeadToHeadDto extends HeadToHeadDto {
  @ApiProperty({ type: AppliedFiltersDto })
  filters: AppliedFiltersDto;

  @ApiProperty({ description: 'Length of `matches`, which `limit` caps.' })
  count: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: [MatchSummaryDto], description: 'Most recent meeting first.' })
  matches: MatchSummaryDto[];
}
