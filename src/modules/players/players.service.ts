import { Injectable } from '@nestjs/common';
import { pageWindow, paginationOf } from 'src/common/dto/pagination.dto';
import {
  battingAverage,
  battingStrikeRate,
  bowlingAverage,
  bowlingEconomy,
  bowlingStrikeRate,
} from 'src/common/formatting/averages.util';
import { toBool, toInt, toIntOrZero } from 'src/common/formatting/numbers';
import { battingLine, bestFigures, highestScore } from 'src/common/formatting/score.util';
import { PLAYER_PAGE_NOTE } from 'src/common/provenance/notes';
import {
  mergeSummaries,
  sourceRef,
  summariseCounts,
} from 'src/common/provenance/source.util';
import {
  BattingSummaryDto,
  BowlingSummaryDto,
  PlayerPageDto,
  RecentInningsDto,
} from './dto/player-page.dto';
import { PlayerQueryDto } from './dto/player-query.dto';
import {
  BattingAggregateRow,
  BestFiguresRow,
  BowlingAggregateRow,
  HighestScoreRow,
  PlayersRepository,
  RECENT_INNINGS_LIMIT,
  RecentInningsRow,
} from './players.repository';

@Injectable()
export class PlayersService {
  constructor(private readonly repository: PlayersRepository) {}

  async getPlayer(playerId: string, query: PlayerQueryDto): Promise<PlayerPageDto | null> {
    const player = await this.repository.findPlayer(playerId);
    if (!player) return null;

    const format = query.format ?? null;
    const window = pageWindow(query, RECENT_INNINGS_LIMIT);

    const [batting, highest, bowling, best, recent] = await Promise.all([
      this.repository.battingAggregate(playerId, format),
      this.repository.highestScore(playerId, format),
      this.repository.bowlingAggregate(playerId, format),
      this.repository.bestFigures(playerId, format),
      this.repository.recentInnings(playerId, format, window),
    ]);

    const battingSummary = this.toBattingSummary(batting, highest);
    const bowlingSummary = this.toBowlingSummary(bowling, best);

    return {
      player_id: player.player_id,
      ...sourceRef(player.source),
      full_name: player.full_name,
      known_as: player.known_as,
      country: player.country_alpha2,
      bats: player.bats,
      bowls: player.bowls,
      bowling_styles: player.bowling_styles ?? [],
      birth_date: player.birth_date,
      identity_glued: toBool(player.identity_glued),
      daft_player_key: player.daft_player_key,
      sofa_id: toInt(player.sofa_id),
      format,
      batting: battingSummary,
      bowling: bowlingSummary,
      recent_innings: recent.rows.map(this.toRecentInnings),
      pagination: paginationOf(recent, window),
      sources: mergeSummaries(
        [battingSummary.sources, bowlingSummary.sources],
        PLAYER_PAGE_NOTE,
      ),
    };
  }

  private toBattingSummary(
    row: BattingAggregateRow,
    highest: HighestScoreRow | null,
  ): BattingSummaryDto {
    const innings = toIntOrZero(row.innings);
    const outs = toIntOrZero(row.outs);
    const runs = toIntOrZero(row.runs);
    const balls = toIntOrZero(row.balls_faced);
    const inningsWithBalls = toIntOrZero(row.innings_with_balls);
    const highRuns = highest ? toInt(highest.runs) : null;
    const highNotOut = highest ? !toBool(highest.is_out) : false;

    return {
      innings,
      not_outs: innings - outs,
      runs,
      average: battingAverage(runs, outs),
      highest: highRuns,
      highest_not_out: highNotOut,
      highest_score: highestScore(highRuns, highNotOut),
      hundreds: toIntOrZero(row.hundreds),
      fifties: toIntOrZero(row.fifties),
      fours: toIntOrZero(row.fours),
      sixes: toIntOrZero(row.sixes),
      balls_faced: balls,
      innings_with_balls: inningsWithBalls,
      balls_known: innings > 0 && inningsWithBalls === innings,
      strike_rate: battingStrikeRate(row.runs_with_balls, balls),
      sources: summariseCounts(row, PLAYER_PAGE_NOTE),
    };
  }

  private toBowlingSummary(
    row: BowlingAggregateRow,
    best: BestFiguresRow | null,
  ): BowlingSummaryDto {
    const wickets = toIntOrZero(row.wickets);
    const runs = toIntOrZero(row.runs);
    const legalBalls = toIntOrZero(row.legal_balls);

    return {
      innings: toIntOrZero(row.innings),
      overs: row.overs,
      legal_balls: legalBalls,
      maidens: toIntOrZero(row.maidens),
      runs,
      wickets,
      average: bowlingAverage(runs, wickets),
      economy: bowlingEconomy(runs, row.overs_decimal),
      strike_rate: bowlingStrikeRate(legalBalls, wickets),
      best: best ? bestFigures(best.wickets, best.runs_conceded) : null,
      best_wickets: best ? toInt(best.wickets) : null,
      best_runs: best ? toInt(best.runs_conceded) : null,
      sources: summariseCounts(row, PLAYER_PAGE_NOTE),
    };
  }

  private toRecentInnings(row: RecentInningsRow): RecentInningsDto {
    const isOut = toBool(row.is_out);
    return {
      match_id: row.match_id,
      ...sourceRef(row.source),
      start_date: row.start_date,
      format: row.format,
      opponent: row.opponent,
      runs: toInt(row.runs),
      balls: toInt(row.balls_faced),
      out: isOut,
      score: battingLine(row.runs, row.balls_faced, isOut),
    };
  }
}
