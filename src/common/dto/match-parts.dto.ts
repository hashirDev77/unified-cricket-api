import { ApiProperty } from '@nestjs/swagger';

/** Every entity block carries the feed it came from. */
export abstract class SourcedDto {
  @ApiProperty({
    nullable: true,
    type: String,
    enum: ['daft', 'sofascore', 'merged', 'manual'],
  })
  source: string | null;

  @ApiProperty({ nullable: true, type: String, example: 'DAFT' })
  source_label: string | null;
}

export class NamedIdDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class VenueDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  city: string | null;

  @ApiProperty({ nullable: true, type: String })
  country: string | null;
}

export class MatchTeamDto extends SourcedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: '1 for the side batting first.' })
  batting_order: number;

  @ApiProperty({ nullable: true, type: Boolean })
  is_home: boolean | null;
}

export class ResultDto {
  @ApiProperty({ nullable: true, type: String })
  type: string | null;

  @ApiProperty({ nullable: true, type: String })
  winner_id: string | null;

  @ApiProperty({ nullable: true, type: String })
  winner: string | null;

  @ApiProperty({ nullable: true, type: Number })
  margin: number | null;

  @ApiProperty({ nullable: true, type: String })
  margin_unit: string | null;

  @ApiProperty({ nullable: true, type: String })
  summary: string | null;
}
