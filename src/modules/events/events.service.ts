import { Injectable } from '@nestjs/common';
import { dismissalText } from 'src/common/formatting/dismissal.util';
import { toBool, toInt, toIntOrZero } from 'src/common/formatting/numbers';
import { DUELS_NOTE } from 'src/common/provenance/notes';
import { sourceRef, summarise } from 'src/common/provenance/source.util';
import { SourceSystem } from 'src/database/enums/cricket.enums';
import { EventPlayerH2HDto, PlayerDuelDto } from './dto/event-h2h.dto';
import { DeliveryDuelRow, EventRow, EventsRepository, WicketDuelRow } from './events.repository';

/** How the duels were derived, which is not the same thing as which feed they came from. */
type DuelSource = 'deliveries' | 'wickets' | 'none';

interface Matchups {
  source: DuelSource;
  matchups: PlayerDuelDto[];
}

@Injectable()
export class EventsService {
  constructor(private readonly repository: EventsRepository) {}

  async getPlayerH2H(matchId: string): Promise<EventPlayerH2HDto | null> {
    const event = await this.repository.findEvent(matchId);
    if (!event) return null;

    const { source, matchups } = await this.resolveMatchups(event);

    return {
      event_id: event.event_id,
      daft_match_id: event.daft_match_id,
      sofa_id: toInt(event.sofa_id),
      source,
      matchups,
      sources: summarise(matchups, DUELS_NOTE),
    };
  }

  /** Ball-by-ball is preferred; the scorecard only yields the wicket-taking duels. */
  private async resolveMatchups(event: EventRow): Promise<Matchups> {
    if (toBool(event.has_deliveries)) {
      // The delivery table is fed exclusively by SofaScore.
      const feed = SourceSystem.Sofascore;
      const rows = await this.repository.findDeliveryDuels(event.event_id);
      return {
        source: 'deliveries',
        matchups: rows
          .map((row) => this.toDeliveryDuel(row, feed))
          .filter((duel) => duel.balls || duel.wickets),
      };
    }

    if (event.scorecard_source) {
      const feed = event.scorecard_source;
      const rows = await this.repository.findWicketDuels(event.event_id, feed);
      return {
        source: 'wickets',
        matchups: rows.map((row) => this.toWicketDuel(row, feed)),
      };
    }

    return { source: 'none', matchups: [] };
  }

  private toDeliveryDuel(row: DeliveryDuelRow, feed: SourceSystem): PlayerDuelDto {
    const runs = toIntOrZero(row.runs);
    const balls = toIntOrZero(row.balls);
    const wickets = toIntOrZero(row.wickets);
    return {
      ...sourceRef(feed),
      batsman_id: row.batsman_id,
      batsman: row.batsman,
      bowler_id: row.bowler_id,
      bowler: row.bowler,
      balls,
      runs,
      fours: toIntOrZero(row.fours),
      sixes: toIntOrZero(row.sixes),
      wickets,
      summary: wickets ? `${runs} (${balls}), out` : `${runs} (${balls})`,
    };
  }

  private toWicketDuel(row: WicketDuelRow, feed: SourceSystem): PlayerDuelDto {
    return {
      ...sourceRef(feed),
      batsman_id: row.batsman_id,
      batsman: row.batsman,
      bowler_id: row.bowler_id,
      bowler: row.bowler,
      balls: null,
      runs: null,
      fours: null,
      sixes: null,
      wickets: 1,
      summary: dismissalText({
        didNotBat: toBool(row.did_not_bat),
        isOut: toBool(row.is_out),
        dismissalType: row.dismissal_type,
        bowler: row.bowler,
        fielder: row.fielder,
      }),
    };
  }
}
