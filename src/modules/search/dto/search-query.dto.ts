import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { LimitQueryDto } from 'src/common/dto/limit-query.dto';

/** `limit` applies to each result group separately, not to the total. */
export class SearchQueryDto extends LimitQueryDto {
  @ApiProperty({ minLength: 2, maxLength: 80, description: 'Name, alias or source id.' })
  @IsString()
  @Length(2, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q: string;
}
