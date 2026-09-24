import { ApiProperty } from '@nestjs/swagger';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class VersusPlayerDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  identity_glued: boolean;
}

export class VersusMeetingDto {
  @ApiProperty()
  match_id: string;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty()
  format: string;

  @ApiProperty({ nullable: true, type: String })
  competition: string | null;

  @ApiProperty()
  balls: number;

  @ApiProperty()
  runs: number;

  @ApiProperty()
  fours: number;

  @ApiProperty()
  sixes: number;

  @ApiProperty()
  dismissals: number;

  @ApiProperty()
  summary: string;
}

export class PlayerVersusDto {
  @ApiProperty({ type: VersusPlayerDto })
  batter: VersusPlayerDto;

  @ApiProperty({ type: VersusPlayerDto })
  bowler: VersusPlayerDto;

  @ApiProperty()
  matches: number;

  @ApiProperty()
  balls: number;

  @ApiProperty()
  runs: number;

  @ApiProperty()
  fours: number;

  @ApiProperty()
  sixes: number;

  @ApiProperty()
  dismissals: number;

  @ApiProperty({ nullable: true, type: Number })
  strike_rate: number | null;

  @ApiProperty({ nullable: true, type: String, format: 'date' })
  first_match: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date' })
  last_match: string | null;

  @ApiProperty()
  summary: string;

  @ApiProperty({ description: 'Known limits of the underlying ball-by-ball data.' })
  coverage: string;

  @ApiProperty({ type: [VersusMeetingDto] })
  meetings: VersusMeetingDto[];

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;
}
