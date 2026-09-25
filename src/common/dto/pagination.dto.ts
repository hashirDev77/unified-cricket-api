import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_OFFSET, Page, PageWindow } from 'src/common/sql/page.util';
import { LimitQueryDto } from './limit-query.dto';

/** Echoes back the window the caller asked for, and whether rows follow it. */
export class PaginationDto {
  @ApiProperty({ description: 'Rows the window was allowed to hold.' })
  limit: number;

  @ApiProperty({ description: 'Rows skipped before the ones returned.' })
  offset: number;

  @ApiProperty({ description: 'True when more rows exist past this window.' })
  has_more: boolean;
}

/** Each endpoint keeps its own list size, so the default is passed in. */
export function pageWindow(query: LimitQueryDto, defaultLimit: number): PageWindow {
  return { limit: query.limit ?? defaultLimit, offset: query.offset ?? DEFAULT_OFFSET };
}

export function paginationOf(page: Page<unknown>, window: PageWindow): PaginationDto {
  return { limit: window.limit, offset: window.offset, has_more: page.has_more };
}
