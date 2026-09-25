import { Injectable } from '@nestjs/common';
import { MatchSummaryDto } from 'src/common/dto/match-summary.dto';
import { toInt } from 'src/common/formatting/numbers';
import { resultSummary } from 'src/common/formatting/result.util';
import { sourceRef } from 'src/common/provenance/source.util';
import { emptyPage, mapPage, Page } from 'src/common/sql/page.util';
import { groupBy } from 'src/common/sql/query.util';
import {
  MatchListFilters,
  MatchListRepository,
  MatchSideRow,
  MatchSummaryRow,
} from './match-list.repository';

@Injectable()
export class MatchListService {
  constructor(private readonly repository: MatchListRepository) {}

  async findMatches(filters: MatchListFilters = {}): Promise<Page<MatchSummaryDto>> {
    const page = await this.repository.findMatches(filters);
    if (page.rows.length === 0) return emptyPage();

    const sides = await this.repository.findSides(page.rows.map((row) => row.id));
    const byMatch = groupBy(sides, (side) => side.match_id);

    return mapPage(page, (row) => this.toSummary(row, byMatch[row.id] ?? []));
  }

  private toSummary(row: MatchSummaryRow, sides: readonly MatchSideRow[]): MatchSummaryDto {
    return {
      id: row.id,
      ...sourceRef(row.source),
      daft_match_id: row.daft_match_id,
      sofa_id: toInt(row.sofa_id),
      start_date: row.start_date,
      end_date: row.end_date,
      format: row.format,
      gender: row.gender,
      status: row.status,
      competition: row.competition_id
        ? {
            id: row.competition_id,
            name: row.competition_name as string,
            ...sourceRef(row.competition_source),
          }
        : null,
      venue: row.venue_id
        ? {
            id: row.venue_id,
            name: row.venue_name as string,
            city: row.venue_city,
            country: row.venue_country,
            ...sourceRef(row.venue_source),
          }
        : null,
      teams: sides.map((side) => ({
        id: side.id,
        name: side.name,
        ...sourceRef(side.source),
        batting_order: toInt(side.batting_order_side) as number,
        is_home: side.is_home,
      })),
      result: {
        type: row.result_type,
        winner_id: row.winner_id,
        winner: row.winner,
        margin: toInt(row.win_margin),
        margin_unit: row.win_margin_unit,
        summary: resultSummary(row.result_type, row.winner, row.win_margin, row.win_margin_unit),
      },
    };
  }
}
