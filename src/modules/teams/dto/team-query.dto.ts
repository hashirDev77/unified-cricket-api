import { IntersectionType } from '@nestjs/swagger';
import { FormatQueryDto } from 'src/common/dto/format-query.dto';
import { LimitQueryDto } from 'src/common/dto/limit-query.dto';

/** `limit` caps `recent_matches`, which also drives the `form` string. */
export class TeamQueryDto extends IntersectionType(FormatQueryDto, LimitQueryDto) {}
