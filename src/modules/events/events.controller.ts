import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdentityService } from 'src/modules/identity/identity.service';
import { EventPlayerH2HDto } from './dto/event-h2h.dto';
import { EventsService } from './events.service';

@ApiTags('event')
@Controller('cricket/event')
export class EventsController {
  constructor(
    private readonly service: EventsService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':eventId/h2h')
  @ApiOperation({
    summary: 'Batter versus bowler matchups within a single match.',
    description:
      'Returns per-pairing runs, balls and wickets from ball-by-ball data, falling back to wicket-only duels from the scorecard; the top-level `source` names that derivation, not the feed.\n' +
      'Deliveries come from SofaScore alone, so the fallback is what serves DAFT-only matches — `sources` names the feed behind the rows.',
  })
  @ApiOkResponse({ type: EventPlayerH2HDto })
  @ApiNotFoundResponse({ description: 'event not found' })
  async eventPlayerH2H(@Param('eventId') eventKey: string): Promise<EventPlayerH2HDto> {
    const eventId = await this.identity.resolveMatch(eventKey);
    const page = eventId ? await this.service.getPlayerH2H(eventId) : null;
    if (!page) throw new NotFoundException('event not found');
    return page;
  }
}
