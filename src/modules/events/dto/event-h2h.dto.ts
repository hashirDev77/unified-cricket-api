import { ApiProperty } from '@nestjs/swagger';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class PlayerDuelDto extends SourcedDto {
  @ApiProperty()
  batsman_id: string;

  @ApiProperty()
  batsman: string;

  @ApiProperty()
  bowler_id: string;

  @ApiProperty()
  bowler: string;

  @ApiProperty({ nullable: true, type: Number })
  balls: number | null;

  @ApiProperty({ nullable: true, type: Number })
  runs: number | null;

  @ApiProperty({ nullable: true, type: Number })
  fours: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sixes: number | null;

  @ApiProperty()
  wickets: number;

  @ApiProperty()
  summary: string;
}

export class EventPlayerH2HDto {
  @ApiProperty()
  event_id: string;

  @ApiProperty({ nullable: true, type: String })
  daft_match_id: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({
    enum: ['deliveries', 'wickets', 'none'],
    description:
      'Which underlying table produced the matchups, not the feed. See `sources` for provenance.',
  })
  source: string;

  @ApiProperty({ type: [PlayerDuelDto] })
  matchups: PlayerDuelDto[];

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;
}
