import { ApiProperty } from '@nestjs/swagger';
import { SourcedDto } from 'src/common/dto/match-parts.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseSourcesDto } from 'src/common/dto/source.dto';
import { FormMatchDto } from 'src/modules/records/dto/records.dto';

export class FormatRecordDto {
  @ApiProperty()
  format: string;

  @ApiProperty()
  played: number;

  @ApiProperty()
  won: number;

  @ApiProperty()
  lost: number;

  @ApiProperty()
  drawn: number;

  @ApiProperty()
  tied: number;

  @ApiProperty()
  no_result: number;

  @ApiProperty({ type: ResponseSourcesDto, description: 'Feed mix behind these counts.' })
  sources: ResponseSourcesDto;
}

export class TeamPageDto extends SourcedDto {
  @ApiProperty()
  team_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  short_name: string | null;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;

  @ApiProperty({ nullable: true, type: String })
  gender: string | null;

  @ApiProperty({ nullable: true, type: Boolean })
  is_national: boolean | null;

  @ApiProperty({ nullable: true, type: Number })
  sofa_id: number | null;

  @ApiProperty({ nullable: true, type: String })
  format: string | null;

  @ApiProperty({ type: [FormatRecordDto] })
  results: FormatRecordDto[];

  @ApiProperty({ description: 'Most recent result last.' })
  form: string;

  @ApiProperty({ type: [FormMatchDto] })
  recent_matches: FormMatchDto[];

  @ApiProperty({ type: PaginationDto, description: 'Window over `recent_matches`.' })
  pagination: PaginationDto;

  @ApiProperty({ type: ResponseSourcesDto })
  sources: ResponseSourcesDto;
}
