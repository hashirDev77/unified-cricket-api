import { IntersectionType } from '@nestjs/swagger';
import { FormatQueryDto } from 'src/common/dto/format-query.dto';
import { LimitQueryDto } from 'src/common/dto/limit-query.dto';

/** `limit` caps `recent_innings`; the career aggregates always cover everything. */
export class PlayerQueryDto extends IntersectionType(FormatQueryDto, LimitQueryDto) {}
