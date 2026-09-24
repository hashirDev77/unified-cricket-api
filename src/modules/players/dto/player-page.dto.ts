import { ApiProperty } from '@nestjs/swagger';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class BattingSummaryDto {
  @ApiProperty()
  innings: number;

  @ApiProperty()
  not_outs: number;

  @ApiProperty()
  runs: number;

  @ApiProperty({ nullable: true, type: Number })
  average: number | null;

  @ApiProperty({ nullable: true, type: Number })
  highest: number | null;

  @ApiProperty()
  highest_not_out: boolean;

  @ApiProperty({ nullable: true, type: String })
  highest_score: string | null;

  @ApiProperty()
  hundreds: number;

  @ApiProperty()
  fifties: number;

  @ApiProperty()
  fours: number;

  @ApiProperty()
  sixes: number;

  @ApiProperty()
  balls_faced: number;

  @ApiProperty()
  innings_with_balls: number;

  @ApiProperty({ description: 'True when every innings has a recorded ball count.' })
  balls_known: boolean;

  @ApiProperty({ nullable: true, type: Number })
  strike_rate: number | null;

  @ApiProperty({ type: ResponseSourcesDto, description: 'Feed mix behind these totals.' })
  sources: ResponseSourcesDto;
}

export class BowlingSummaryDto {
  @ApiProperty()
  innings: number;

  @ApiProperty({ nullable: true, type: String })
  overs: string | null;

  @ApiProperty()
  legal_balls: number;

  @ApiProperty()
  maidens: number;

  @ApiProperty()
  runs: number;

  @ApiProperty()
  wickets: number;

  @ApiProperty({ nullable: true, type: Number })
  average: number | null;

  @ApiProperty({ nullable: true, type: Number })
  economy: number | null;

  @ApiProperty({ nullable: true, type: Number })
  strike_rate: number | null;

  @ApiProperty({ nullable: true, type: String })
  best: string | null;

  @ApiProperty({ nullable: true, type: Number })
  best_wickets: number | null;

  @ApiProperty({ nullable: true, type: Number })
  best_runs: number | null;

  @ApiProperty({ type: ResponseSourcesDto, description: 'Feed mix behind these totals.' })
  sources: ResponseSourcesDto;
}

export class RecentInningsDto extends SourcedDto {
  @ApiProperty()
  match_id: string;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty()
  format: string;

  @ApiProperty({ nullable: true, type: String })
  opponent: string | null;

  @ApiProperty({ nullable: true, type: Number })
  runs: number | null;

  @ApiProperty({ nullable: true, type: Number })
  balls: number | null;

  @ApiProperty()
  out: boolean;

  @ApiProperty({ nullable: true, type: String })
  score: string | null;
}

export class PlayerPageDto extends SourcedDto {
  @ApiProperty()
  player_id: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty({ nullable: true, type: String })
  known_as: string | null;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty({ nullable: true, type: String })
  bats: string | null;

  @ApiProperty({ nullable: true, type: String })
  bowls: string | null;

  @ApiProperty({ type: [String] })
  bowling_styles: string[];

  @ApiProperty({ nullable: true, type: String, format: 'date' })
  birth_date: string | null;

  @ApiProperty({ description: 'True when the player is matched in both source systems.' })
  identity_glued: boolean;

  @ApiProperty({ nullable: true, type: String })
  daft_player_key: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({ nullable: true, type: String })
  format: string | null;

  @ApiProperty({ type: BattingSummaryDto })
  batting: BattingSummaryDto;

  @ApiProperty({ type: BowlingSummaryDto })
  bowling: BowlingSummaryDto;

  @ApiProperty({ type: [RecentInningsDto] })
  recent_innings: RecentInningsDto[];

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;
}
