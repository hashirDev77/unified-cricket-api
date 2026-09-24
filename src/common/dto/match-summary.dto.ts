import { ApiProperty } from '@nestjs/swagger';
import { MatchTeamDto, NamedIdDto, ResultDto, SourcedDto, VenueDto } from './match-parts.dto';

/** The list-row view of a match, shared by every endpoint that returns many matches. */
export class MatchSummaryDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true, type: String })
  daft_match_id: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty({ nullable: true, type: String, format: 'date' })
  end_date: string | null;

  @ApiProperty()
  format: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true, type: NamedIdDto })
  competition: NamedIdDto | null;

  @ApiProperty({ nullable: true, type: VenueDto })
  venue: VenueDto | null;

  @ApiProperty({ type: [MatchTeamDto], description: 'Ordered by batting side.' })
  teams: MatchTeamDto[];

  @ApiProperty({ type: ResultDto })
  result: ResultDto;
}
