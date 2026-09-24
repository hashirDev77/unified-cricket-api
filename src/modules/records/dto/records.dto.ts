import { ApiProperty } from '@nestjs/swagger';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';

export class FormMatchDto {
  @ApiProperty()
  match_id: string;

  @ApiProperty({ format: 'date' })
  start_date: string;

  @ApiProperty()
  format: string;

  @ApiProperty({ nullable: true, type: String })
  competition: string | null;

  @ApiProperty({ nullable: true, type: String })
  opponent_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  opponent: string | null;

  @ApiProperty({ description: 'W, L, D, T or N' })
  result: string;

  @ApiProperty()
  summary: string;
}

export class TeamFormDto {
  @ApiProperty()
  team_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'Most recent result last.' })
  form: string;

  @ApiProperty({ type: [FormMatchDto] })
  matches: FormMatchDto[];
}

export class H2HSideDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  won: number;
}

export class HeadToHeadDto {
  @ApiProperty()
  played: number;

  @ApiProperty()
  drawn: number;

  @ApiProperty()
  tied: number;

  @ApiProperty()
  no_result: number;

  @ApiProperty({ type: [H2HSideDto] })
  teams: H2HSideDto[];

  @ApiProperty({ type: ResponseSourcesDto, description: 'Feed mix behind these counts.' })
  sources: ResponseSourcesDto;
}
