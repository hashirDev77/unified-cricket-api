import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdentityService } from 'src/modules/identity/identity.service';
import { PlayerPageDto } from './dto/player-page.dto';
import { PlayerQueryDto } from './dto/player-query.dto';
import { PlayerVersusDto } from './dto/player-versus.dto';
import { PlayersService } from './players.service';
import { VersusService } from './versus.service';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(
    private readonly players: PlayersService,
    private readonly versus: VersusService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':batterId/versus/:bowlerId')
  @ApiOperation({
    summary: 'Ball-by-ball record of one batter against one bowler.',
    description:
      'Returns career aggregates for the pairing plus the dismissals, derived from individual deliveries.\n' +
      'Ball-by-ball data exists only on the SofaScore side of the database, so this endpoint covers the seasons SofaScore has scraped.',
  })
  @ApiOkResponse({ type: PlayerVersusDto })
  @ApiBadRequestResponse({ description: 'batter and bowler are the same player' })
  @ApiNotFoundResponse({ description: 'batter or bowler not found' })
  async playerVersus(
    @Param('batterId') batterKey: string,
    @Param('bowlerId') bowlerKey: string,
  ): Promise<PlayerVersusDto> {
    const [batterId, bowlerId] = await Promise.all([
      this.identity.resolvePlayer(batterKey),
      this.identity.resolvePlayer(bowlerKey),
    ]);
    if (!batterId) throw new NotFoundException('batter not found');
    if (!bowlerId) throw new NotFoundException('bowler not found');
    if (batterId === bowlerId) {
      throw new BadRequestException('batter and bowler are the same player');
    }

    const absent = await this.versus.missingSide(batterId, bowlerId);
    if (absent) throw new NotFoundException(`${absent} not found`);

    return (await this.versus.getVersus(batterId, bowlerId)) as PlayerVersusDto;
  }

  @Get(':playerId')
  @ApiOperation({
    summary: 'Career page by uuid, SofaScore id or DAFT player key.',
    description:
      'Returns career batting and bowling aggregates plus the most recent innings, optionally narrowed to one format.\n' +
      'Totals are summed from scorecard rows, which are predominantly DAFT with SofaScore contributing recent seasons; `batting.sources` and `bowling.sources` give the split.',
  })
  @ApiOkResponse({ type: PlayerPageDto })
  @ApiNotFoundResponse({ description: 'player not found' })
  async getPlayer(
    @Param('playerId') playerKey: string,
    @Query() query: PlayerQueryDto,
  ): Promise<PlayerPageDto> {
    const playerId = await this.identity.resolvePlayer(playerKey);
    const page = playerId
      ? await this.players.getPlayer(playerId, query.format ?? null, query.limit)
      : null;
    if (!page) throw new NotFoundException('player not found');
    return page;
  }
}
