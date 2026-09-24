import { ApiProperty } from '@nestjs/swagger';
import {
  MatchTeamDto,
  NamedIdDto,
  ResultDto,
  SourcedDto,
  VenueDto,
} from 'src/common/dto/match-parts.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';
import { HeadToHeadDto, TeamFormDto } from 'src/modules/records/dto/records.dto';

export { MatchTeamDto, NamedIdDto, ResultDto, VenueDto };

export class TossDto {
  @ApiProperty({ nullable: true, type: String })
  winner_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  winner: string | null;

  @ApiProperty({ nullable: true, type: String })
  decision: string | null;
}

export class ExtrasDto {
  @ApiProperty({ nullable: true, type: Number })
  byes: number | null;

  @ApiProperty({ nullable: true, type: Number })
  leg_byes: number | null;

  @ApiProperty({ nullable: true, type: Number })
  wides: number | null;

  @ApiProperty({ nullable: true, type: Number })
  no_balls: number | null;

  @ApiProperty({ nullable: true, type: Number })
  penalties: number | null;
}

export class BattingLineDto extends SourcedDto {
  @ApiProperty()
  player_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: Number })
  position: number | null;

  @ApiProperty({ nullable: true, type: Number })
  runs: number | null;

  @ApiProperty({ nullable: true, type: Number })
  balls: number | null;

  @ApiProperty({ nullable: true, type: Number })
  fours: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sixes: number | null;

  @ApiProperty()
  dismissal: string;

  @ApiProperty()
  did_not_bat: boolean;
}

export class BowlingLineDto extends SourcedDto {
  @ApiProperty()
  player_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: Number })
  position: number | null;

  @ApiProperty({ nullable: true, type: String, description: 'Cricket notation, not a decimal.' })
  overs: string | null;

  @ApiProperty({ nullable: true, type: Number })
  maidens: number | null;

  @ApiProperty({ nullable: true, type: Number })
  runs: number | null;

  @ApiProperty({ nullable: true, type: Number })
  wickets: number | null;

  @ApiProperty({ nullable: true, type: Number })
  wides: number | null;

  @ApiProperty({ nullable: true, type: Number })
  no_balls: number | null;

  @ApiProperty({ nullable: true, type: Number })
  economy: number | null;
}

export class InningsCardDto extends SourcedDto {
  @ApiProperty()
  innings_number: number;

  @ApiProperty({ nullable: true, type: String })
  batting_team_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  batting_team: string | null;

  @ApiProperty({ nullable: true, type: String })
  bowling_team_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  bowling_team: string | null;

  @ApiProperty({ nullable: true, type: String })
  score: string | null;

  @ApiProperty({ nullable: true, type: Number })
  runs: number | null;

  @ApiProperty({ nullable: true, type: Number })
  wickets: number | null;

  @ApiProperty({ nullable: true, type: String })
  overs: string | null;

  @ApiProperty({ nullable: true, type: Boolean })
  declared: boolean | null;

  @ApiProperty()
  follow_on: boolean;

  @ApiProperty({ nullable: true, type: Number })
  target: number | null;

  @ApiProperty({ type: ExtrasDto })
  extras: ExtrasDto;

  @ApiProperty({ type: [BattingLineDto] })
  batting: BattingLineDto[];

  @ApiProperty({ type: [BowlingLineDto] })
  bowling: BowlingLineDto[];
}

export class ScorecardDto {
  @ApiProperty({ nullable: true, type: String, description: 'Feed that supplied these rows.' })
  source: string | null;

  @ApiProperty({ nullable: true, type: String })
  source_label: string | null;

  @ApiProperty({ type: [InningsCardDto] })
  innings: InningsCardDto[];
}

export class AwardDto extends SourcedDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  rank: number;

  @ApiProperty({ nullable: true, type: String })
  player_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  player: string | null;

  @ApiProperty({ nullable: true, type: String })
  team: string | null;
}

export class MatchPageDto extends SourcedDto {
  @ApiProperty()
  match_id: string;

  @ApiProperty({ nullable: true, type: String })
  daft_match_id: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  start_time: string | null;

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

  @ApiProperty({ type: [MatchTeamDto] })
  teams: MatchTeamDto[];

  @ApiProperty({ nullable: true, type: TossDto })
  toss: TossDto | null;

  @ApiProperty({ type: ResultDto })
  result: ResultDto;

  @ApiProperty({ type: ScorecardDto })
  scorecard: ScorecardDto;

  @ApiProperty({ type: [AwardDto] })
  awards: AwardDto[];

  @ApiProperty({ type: [TeamFormDto] })
  form: TeamFormDto[];

  @ApiProperty({ nullable: true, type: HeadToHeadDto })
  head_to_head: HeadToHeadDto | null;

  @ApiProperty()
  has_scorecard: boolean;

  @ApiProperty()
  has_deliveries: boolean;

  @ApiProperty()
  has_odds: boolean;

  @ApiProperty()
  has_partnerships: boolean;

  @ApiProperty()
  has_lineup: boolean;

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;
}
