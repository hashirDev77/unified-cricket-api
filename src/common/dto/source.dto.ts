import { ApiProperty } from '@nestjs/swagger';

export class SourceCountDto {
  @ApiProperty({ enum: ['daft', 'sofascore', 'merged', 'manual'] })
  source: string;

  @ApiProperty()
  source_label: string;

  @ApiProperty({ description: 'Rows in this response that came from the feed.' })
  rows: number;
}

/** Which side of the unified database produced the data in this response. */
export class ResponseSourcesDto {
  @ApiProperty({ nullable: true, type: String, description: 'The feed contributing most rows.' })
  primary: string | null;

  @ApiProperty({ nullable: true, type: String })
  primary_label: string | null;

  @ApiProperty({ description: 'True when more than one feed contributed.' })
  blended: boolean;

  @ApiProperty({ type: [SourceCountDto], description: 'Largest contributor first.' })
  breakdown: SourceCountDto[];

  @ApiProperty({ description: 'Plain-language note about how this endpoint is fed.' })
  note: string;
}
