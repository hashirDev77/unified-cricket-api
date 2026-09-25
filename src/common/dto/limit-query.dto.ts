import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_LIMIT = 100;

/** Left optional so each endpoint keeps its own default when the caller omits it. */
export class LimitQueryDto {
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: MAX_LIMIT,
    description: 'How many rows to return in the list part of the response.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    default: 0,
    description: 'How many rows to skip before the ones returned.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
