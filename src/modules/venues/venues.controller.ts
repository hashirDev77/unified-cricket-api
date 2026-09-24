import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VenueMatchesQueryDto } from './dto/venue-matches-query.dto';
import { VenueMatchesDto } from './dto/venue-matches.dto';
import { VenuesService } from './venues.service';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly service: VenuesService) {}

  @Get(':venueId/matches')
  @ApiOperation({
    summary: 'Matches played at one venue, by uuid, SofaScore id or venue name.',
    description:
      'Returns the venue profile and its fixture rows; venue names repeat across countries, so a name resolves to the ground with the most matches.\n' +
      'Venues are almost entirely DAFT, while the fixtures mix DAFT history with SofaScore coverage of recent seasons.',
  })
  @ApiOkResponse({ type: VenueMatchesDto })
  @ApiNotFoundResponse({ description: 'venue not found' })
  async findMatches(
    @Param('venueId') venueKey: string,
    @Query() query: VenueMatchesQueryDto,
  ): Promise<VenueMatchesDto> {
    const result = await this.service.findMatches(venueKey, query);
    if (!result) throw new NotFoundException('venue not found');
    return result;
  }
}
