import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search players, teams, competitions, venues and matches by name or source id.',
    description:
      'Returns identity rows only — names and ids, no statistics — grouped by entity type and capped by `limit` per group.\n' +
      'Names and aliases from both feeds are indexed together, so each hit carries the feed that owns it and `sources` totals them.',
  })
  @ApiOkResponse({ type: SearchResponseDto })
  search(@Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.service.search(query);
  }
}
