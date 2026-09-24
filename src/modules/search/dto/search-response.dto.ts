import { ApiProperty } from '@nestjs/swagger';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class PlayerHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty()
  identity_glued: boolean;

  @ApiProperty({ nullable: true, type: String })
  daft_player_key: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;
}

export class TeamHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty({ nullable: true, type: String })
  gender: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;
}

export class CompetitionHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;
}

export class VenueHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  city: string | null;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;
}

export class MatchTeamHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class MatchHitDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true, type: String })
  competition: string | null;

  @ApiProperty({ type: [MatchTeamHitDto] })
  teams: MatchTeamHitDto[];

  @ApiProperty({ nullable: true, type: String })
  daft_match_id: string | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;
}

export class SearchResponseDto {
  @ApiProperty()
  query: string;

  @ApiProperty({ type: [PlayerHitDto] })
  players: PlayerHitDto[];

  @ApiProperty({ type: [TeamHitDto] })
  teams: TeamHitDto[];

  @ApiProperty({ type: [CompetitionHitDto] })
  competitions: CompetitionHitDto[];

  @ApiProperty({ type: [VenueHitDto] })
  venues: VenueHitDto[];

  @ApiProperty({ type: [MatchHitDto] })
  matches: MatchHitDto[];

  @ApiProperty({ type: ResponseSourcesDto, description: 'Feed mix across every hit above.' })
  sources: ResponseSourcesDto;
}
