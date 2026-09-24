import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdentityService } from 'src/modules/identity/identity.service';
import { MatchListDto } from './dto/match-list.dto';
import { MatchPageDto } from './dto/match-page.dto';
import { MatchSearchQueryDto } from './dto/match-search-query.dto';
import { MatchesService } from './matches.service';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(
    private readonly service: MatchesService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Most recent matches, optionally by venue country and format.',
    description:
      'Returns fixture rows only — dates, teams, venue and result, with no scorecard.\n' +
      'The bulk of this history is DAFT, with SofaScore covering recent and live matches; `sources` reports the mix for the rows returned.',
  })
  @ApiOkResponse({ type: MatchListDto })
  findMatches(@Query() query: MatchSearchQueryDto): Promise<MatchListDto> {
    return this.service.findMatches(query);
  }

  @Get(':matchId')
  @ApiOperation({
    summary: 'Full match page by uuid, SofaScore id or DAFT match id.',
    description:
      'Returns the fixture, the innings-by-innings scorecard, awards, recent form and the head-to-head record.\n' +
      'Scorecards come from whichever feed supplied them, named in `scorecard.source`; DAFT covers the history and SofaScore the recent seasons.',
  })
  @ApiOkResponse({ type: MatchPageDto })
  @ApiNotFoundResponse({ description: 'match not found' })
  async getMatch(@Param('matchId') matchId: string): Promise<MatchPageDto> {
    const resolved = await this.identity.resolveMatch(matchId);
    const page = resolved ? await this.service.getMatch(resolved) : null;
    if (!page) throw new NotFoundException('match not found');
    return page;
  }
}
