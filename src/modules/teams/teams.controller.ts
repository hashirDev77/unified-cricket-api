import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IdentityService } from 'src/modules/identity/identity.service';
import { TeamHeadToHeadDto } from './dto/team-head-to-head.dto';
import { TeamPageDto } from './dto/team-page.dto';
import { TeamQueryDto } from './dto/team-query.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(
    private readonly service: TeamsService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':teamAId/versus/:teamBId')
  @ApiOperation({
    summary: 'Completed-match record between two teams, plus the meetings.',
    description:
      'Returns aggregate win/loss/draw counts over every completed meeting, then the most recent meetings as fixture rows.\n' +
      'The counts span both feeds: DAFT for the historic meetings and SofaScore for recent seasons, broken down in `sources`.',
  })
  @ApiOkResponse({ type: TeamHeadToHeadDto })
  @ApiBadRequestResponse({ description: 'both ids resolve to the same team' })
  @ApiNotFoundResponse({ description: 'team not found' })
  async headToHead(
    @Param('teamAId') teamAKey: string,
    @Param('teamBId') teamBKey: string,
    @Query() query: TeamQueryDto,
  ): Promise<TeamHeadToHeadDto> {
    const [teamAId, teamBId] = await Promise.all([
      this.identity.resolveTeam(teamAKey),
      this.identity.resolveTeam(teamBKey),
    ]);
    if (!teamAId || !teamBId) throw new NotFoundException('team not found');
    if (teamAId === teamBId) throw new BadRequestException('both ids resolve to the same team');

    const result = await this.service.headToHead(teamAId, teamBId, query);
    if (!result) throw new NotFoundException('team not found');
    return result;
  }

  @Get(':teamId')
  @ApiOperation({
    summary: 'Team page by uuid or SofaScore id.',
    description:
      'Returns the team profile, a per-format win/loss record and a recent-form string.\n' +
      'Team rows are predominantly DAFT with some SofaScore and a handful entered manually; the records themselves span both feeds.',
  })
  @ApiOkResponse({ type: TeamPageDto })
  @ApiNotFoundResponse({ description: 'team not found' })
  async getTeam(
    @Param('teamId') teamKey: string,
    @Query() query: TeamQueryDto,
  ): Promise<TeamPageDto> {
    const teamId = await this.identity.resolveTeam(teamKey);
    const page = teamId
      ? await this.service.getTeam(teamId, query.format ?? null, query.limit)
      : null;
    if (!page) throw new NotFoundException('team not found');
    return page;
  }
}
