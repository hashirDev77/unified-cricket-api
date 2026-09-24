import { Injectable } from '@nestjs/common';
import { toBool, toInt } from 'src/common/formatting/numbers';
import { SEARCH_NOTE } from 'src/common/provenance/notes';
import { sourceRef, summarise } from 'src/common/provenance/source.util';
import { groupBy } from 'src/common/sql/query.util';
import {
  MatchListRepository,
  MatchSideRow,
} from 'src/modules/match-list/match-list.repository';
import { MatchHitDto, SearchResponseDto } from './dto/search-response.dto';
import { MatchHitRow, SearchRepository } from './search.repository';

const DEFAULT_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly matchList: MatchListRepository,
  ) {}

  async search(query: string, limit = DEFAULT_LIMIT): Promise<SearchResponseDto> {
    const terms = SearchRepository.terms(query, limit);

    const [players, teams, competitions, venues, matchRows] = await Promise.all([
      this.repository.findPlayers(terms),
      this.repository.findTeams(terms),
      this.repository.findCompetitions(terms),
      this.repository.findVenues(terms),
      this.repository.findMatches(terms),
    ]);

    const matchTeams = await this.matchList.findSides(matchRows.map((row) => row.id));
    const teamsByMatch = groupBy(matchTeams, (row) => row.match_id);

    return {
      query,
      players: players.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        country: row.country,
        identity_glued: toBool(row.identity_glued),
        daft_player_key: row.daft_player_key,
        sofa_id: toInt(row.sofa_id),
      })),
      teams: teams.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        country: row.country,
        gender: row.gender,
        sofa_id: toInt(row.sofa_id),
      })),
      competitions: competitions.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        format: row.format,
        gender: row.gender,
        sofa_id: toInt(row.sofa_id),
      })),
      venues: venues.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        city: row.city,
        country: row.country,
        sofa_id: toInt(row.sofa_id),
      })),
      matches: matchRows.map((row) => this.toMatchHit(row, teamsByMatch[row.id] ?? [])),
      sources: summarise(
        [...players, ...teams, ...competitions, ...venues, ...matchRows],
        SEARCH_NOTE,
      ),
    };
  }

  private toMatchHit(row: MatchHitRow, teams: MatchSideRow[]): MatchHitDto {
    return {
      id: row.id,
      ...sourceRef(row.source),
      start_date: row.start_date,
      format: row.format,
      status: row.status,
      competition: row.competition,
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        ...sourceRef(team.source),
      })),
      daft_match_id: row.daft_match_id,
      sofa_id: toInt(row.sofa_id),
    };
  }
}
