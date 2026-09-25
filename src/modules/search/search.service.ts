import { Injectable } from '@nestjs/common';
import { pageWindow } from 'src/common/dto/pagination.dto';
import { toBool, toInt } from 'src/common/formatting/numbers';
import { SEARCH_NOTE } from 'src/common/provenance/notes';
import { sourceRef, summarise } from 'src/common/provenance/source.util';
import { groupBy } from 'src/common/sql/query.util';
import {
  MatchListRepository,
  MatchSideRow,
} from 'src/modules/match-list/match-list.repository';
import { SearchQueryDto } from './dto/search-query.dto';
import { MatchHitDto, SearchResponseDto } from './dto/search-response.dto';
import { MatchHitRow, SearchRepository } from './search.repository';

const DEFAULT_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly matchList: MatchListRepository,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const window = pageWindow(query, DEFAULT_LIMIT);
    const terms = SearchRepository.terms(query.q, window);

    const [players, teams, competitions, venues, matches] = await Promise.all([
      this.repository.findPlayers(terms),
      this.repository.findTeams(terms),
      this.repository.findCompetitions(terms),
      this.repository.findVenues(terms),
      this.repository.findMatches(terms),
    ]);

    const matchTeams = await this.matchList.findSides(matches.rows.map((row) => row.id));
    const teamsByMatch = groupBy(matchTeams, (row) => row.match_id);

    return {
      query: query.q,
      players: players.rows.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        country: row.country,
        identity_glued: toBool(row.identity_glued),
        daft_player_key: row.daft_player_key,
        sofa_id: toInt(row.sofa_id),
      })),
      teams: teams.rows.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        country: row.country,
        gender: row.gender,
        sofa_id: toInt(row.sofa_id),
      })),
      competitions: competitions.rows.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        format: row.format,
        gender: row.gender,
        sofa_id: toInt(row.sofa_id),
      })),
      venues: venues.rows.map((row) => ({
        id: row.id,
        ...sourceRef(row.source),
        name: row.name,
        city: row.city,
        country: row.country,
        sofa_id: toInt(row.sofa_id),
      })),
      matches: matches.rows.map((row) => this.toMatchHit(row, teamsByMatch[row.id] ?? [])),
      pagination: {
        limit: window.limit,
        offset: window.offset,
        // One flag per group, because `limit` windows each group on its own.
        has_more: {
          players: players.has_more,
          teams: teams.has_more,
          competitions: competitions.has_more,
          venues: venues.has_more,
          matches: matches.has_more,
        },
      },
      sources: summarise(
        [
          ...players.rows,
          ...teams.rows,
          ...competitions.rows,
          ...venues.rows,
          ...matches.rows,
        ],
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
