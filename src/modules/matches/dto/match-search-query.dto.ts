import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
import { FormatQueryDto } from 'src/common/dto/format-query.dto';
import { LimitQueryDto } from 'src/common/dto/limit-query.dto';

/** Returns the most recent matches, narrowed by whichever filters are supplied. */
export class MatchSearchQueryDto extends IntersectionType(FormatQueryDto, LimitQueryDto) {
  @ApiPropertyOptional({
    example: 'England',
    description: 'Country of the venue the match was played at.',
  })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  country?: string;
}
