import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchFormat } from 'src/database/enums/cricket.enums';

export class FormatQueryDto {
  @ApiPropertyOptional({ enum: MatchFormat, description: 'Restrict statistics to one format.' })
  @IsOptional()
  @IsEnum(MatchFormat)
  format?: MatchFormat;
}
