import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { FormatQueryDto } from 'src/common/dto/format-query.dto';
import { LimitQueryDto } from 'src/common/dto/limit-query.dto';

export class VenueMatchesQueryDto extends IntersectionType(FormatQueryDto, LimitQueryDto) {
  @ApiPropertyOptional({
    description:
      'Narrow to one match by uuid, SofaScore id or DAFT match id. Omit it to get every match at the venue.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  match_id?: string;
}
