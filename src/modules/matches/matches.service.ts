import { Injectable } from '@nestjs/common';
import { spellEconomy } from 'src/common/formatting/averages.util';
import { dismissalText } from 'src/common/formatting/dismissal.util';
import { toBool, toInt } from 'src/common/formatting/numbers';
import { resultSummary } from 'src/common/formatting/result.util';
import { scoreLine } from 'src/common/formatting/score.util';
import { MATCH_LIST_NOTE, MATCH_PAGE_NOTE } from 'src/common/provenance/notes';
import { sourceLabel, sourceRef, summarise } from 'src/common/provenance/source.util';
import { groupBy } from 'src/common/sql/query.util';
import { MatchListService } from 'src/modules/match-list/match-list.service';
import { HeadToHeadDto, TeamFormDto } from 'src/modules/records/dto/records.dto';
import { RecordsService } from 'src/modules/records/records.service';
import { MatchListDto } from './dto/match-list.dto';
import { MatchSearchQueryDto } from './dto/match-search-query.dto';
import {
  AwardDto,
  BattingLineDto,
  BowlingLineDto,
  InningsCardDto,
  MatchPageDto,
  MatchTeamDto,
} from './dto/match-page.dto';
import {
  BattingRow,
  BowlingRow,
  InningsRow,
  MatchesRepository,
  MatchHeaderRow,
  MatchTeamRow,
} from './matches.repository';

const FORM_LIMIT = 5;
const SEARCH_LIMIT = 20;

@Injectable()
export class MatchesService {
  constructor(
    private readonly repository: MatchesRepository,
    private readonly records: RecordsService,
    private readonly matchList: MatchListService,
  ) {}

  async findMatches(query: MatchSearchQueryDto): Promise<MatchListDto> {
    const format = query.format ?? null;
    const country = query.country ?? null;

    const matches = await this.matchList.findMatches({
      format,
      country,
      limit: query.limit ?? SEARCH_LIMIT,
    });

    return {
      filters: { format, country },
      count: matches.length,
      sources: summarise(matches, MATCH_LIST_NOTE),
      matches,
    };
  }

  async getMatch(matchId: string): Promise<MatchPageDto | null> {
    const [header, teamRows, awardRows] = await Promise.all([
      this.repository.findHeader(matchId),
      this.repository.findTeams(matchId),
      this.repository.findAwards(matchId),
    ]);
    if (!header) return null;

    const teams = teamRows.map(this.toTeam);
    const source = header.scorecard_source;

    const [inningsRows, battingRows, bowlingRows, form, headToHead] = await Promise.all([
      source ? this.repository.findInnings(matchId, source) : Promise.resolve([]),
      source ? this.repository.findBatting(matchId, source) : Promise.resolve([]),
      source ? this.repository.findBowling(matchId, source) : Promise.resolve([]),
      this.teamForms(teams, header.start_date, matchId),
      this.headToHead(teams),
    ]);

    const battingByInnings = groupBy(battingRows, (row) => row.innings_id);
    const bowlingByInnings = groupBy(bowlingRows, (row) => row.innings_id);

    return {
      match_id: header.match_id,
      ...sourceRef(header.source),
      daft_match_id: header.daft_match_id,
      sofa_id: toInt(header.sofa_id),
      start_date: header.start_date,
      start_time: header.start_time,
      end_date: header.end_date,
      format: header.format,
      gender: header.gender,
      status: header.status,
      competition: header.competition_id
        ? {
            id: header.competition_id,
            name: header.competition_name as string,
            ...sourceRef(header.competition_source),
          }
        : null,
      venue: header.venue_id
        ? {
            id: header.venue_id,
            name: header.venue_name as string,
            city: header.venue_city,
            country: header.venue_country,
            ...sourceRef(header.venue_source),
          }
        : null,
      teams,
      toss:
        header.toss_winner_id || header.toss_decision
          ? {
              winner_id: header.toss_winner_id,
              winner: header.toss_winner,
              decision: header.toss_decision,
            }
          : null,
      result: this.toResult(header),
      scorecard: {
        source,
        source_label: sourceLabel(source),
        innings: inningsRows.map((row) =>
          this.toInningsCard(
            row,
            battingByInnings[row.innings_id] ?? [],
            bowlingByInnings[row.innings_id] ?? [],
          ),
        ),
      },
      awards: awardRows.map(
        (row): AwardDto => ({
          ...sourceRef(row.source),
          type: row.award_type,
          rank: toInt(row.award_rank) as number,
          player_id: row.player_id,
          player: row.player,
          team: row.team,
        }),
      ),
      form,
      head_to_head: headToHead,
      has_scorecard: header.has_scorecard,
      has_deliveries: header.has_deliveries,
      has_odds: header.has_odds,
      has_partnerships: header.has_partnerships,
      has_lineup: header.has_lineup,
      sources: summarise(
        [header, ...teamRows, ...inningsRows, ...battingRows, ...bowlingRows, ...awardRows],
        MATCH_PAGE_NOTE,
      ),
    };
  }

  private toTeam(row: MatchTeamRow): MatchTeamDto {
    return {
      id: row.id,
      name: row.name,
      ...sourceRef(row.source),
      batting_order: toInt(row.batting_order_side) as number,
      is_home: row.is_home,
    };
  }

  private toResult(header: MatchHeaderRow): MatchPageDto['result'] {
    return {
      type: header.result_type,
      winner_id: header.winner_id,
      winner: header.winner,
      margin: toInt(header.win_margin),
      margin_unit: header.win_margin_unit,
      summary: resultSummary(
        header.result_type,
        header.winner,
        header.win_margin,
        header.win_margin_unit,
      ),
    };
  }

  private teamForms(
    teams: MatchTeamDto[],
    beforeDate: string,
    excludeMatchId: string,
  ): Promise<TeamFormDto[]> {
    return Promise.all(
      teams.map((team) =>
        this.records.teamForm(team, { limit: FORM_LIMIT, beforeDate, excludeMatchId }),
      ),
    );
  }

  private headToHead(teams: MatchTeamDto[]): Promise<HeadToHeadDto | null> {
    if (teams.length !== 2) return Promise.resolve(null);
    return this.records.headToHead(teams[0], teams[1]);
  }

  private toInningsCard(
    row: InningsRow,
    batting: BattingRow[],
    bowling: BowlingRow[],
  ): InningsCardDto {
    return {
      ...sourceRef(row.source),
      innings_number: toInt(row.innings_number) as number,
      batting_team_id: row.batting_team_id,
      batting_team: row.batting_team,
      bowling_team_id: row.bowling_team_id,
      bowling_team: row.bowling_team,
      score: scoreLine(row.runs, row.wickets),
      runs: toInt(row.runs),
      wickets: toInt(row.wickets),
      overs: row.overs,
      declared: row.declared,
      follow_on: toBool(row.is_follow_on),
      target: toInt(row.target),
      extras: {
        byes: toInt(row.byes),
        leg_byes: toInt(row.leg_byes),
        wides: toInt(row.wides),
        no_balls: toInt(row.no_balls),
        penalties: toInt(row.penalties),
      },
      batting: batting.map(this.toBattingLine),
      bowling: bowling.map(this.toBowlingLine),
    };
  }

  private toBattingLine(row: BattingRow): BattingLineDto {
    const didNotBat = toBool(row.did_not_bat);
    const isOut = toBool(row.is_out);
    return {
      ...sourceRef(row.source),
      player_id: row.player_id,
      name: row.name,
      position: toInt(row.batting_position),
      runs: toInt(row.runs),
      balls: toInt(row.balls_faced),
      fours: toInt(row.fours),
      sixes: toInt(row.sixes),
      dismissal: dismissalText({
        didNotBat,
        isOut,
        dismissalType: row.dismissal_type,
        bowler: row.bowler,
        fielder: row.fielder,
      }),
      did_not_bat: didNotBat,
    };
  }

  private toBowlingLine(row: BowlingRow): BowlingLineDto {
    return {
      ...sourceRef(row.source),
      player_id: row.player_id,
      name: row.name,
      position: toInt(row.bowling_position),
      overs: row.overs_display,
      maidens: toInt(row.maidens),
      runs: toInt(row.runs_conceded),
      wickets: toInt(row.wickets),
      wides: toInt(row.wides),
      no_balls: toInt(row.no_balls),
      economy: spellEconomy(row.runs_conceded, row.legal_balls, row.balls_per_over),
    };
  }
}
