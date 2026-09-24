import { Injectable } from '@nestjs/common';
import { battingStrikeRate } from 'src/common/formatting/averages.util';
import { toBool, toIntOrZero } from 'src/common/formatting/numbers';
import { PLAYER_VERSUS_NOTE } from 'src/common/provenance/notes';
import { sourceRef, summarise } from 'src/common/provenance/source.util';
import { SourceSystem } from 'src/database/enums/cricket.enums';
import { PlayerVersusDto, VersusMeetingDto, VersusPlayerDto } from './dto/player-versus.dto';
import { MeetingRow, VersusPlayerRow, VersusRepository } from './versus.repository';

const COVERAGE =
  'Ball-by-ball matches from 1 Feb 2022 only. ' +
  'The count is for these two player rows, not other rows of the same person.';

export type VersusSide = 'batter' | 'bowler';

@Injectable()
export class VersusService {
  constructor(private readonly repository: VersusRepository) {}

  /** Returns the side that does not exist, so the caller can name it in the 404. */
  async missingSide(batterId: string, bowlerId: string): Promise<VersusSide | null> {
    const [batter, bowler] = await Promise.all([
      this.repository.findPlayer(batterId),
      this.repository.findPlayer(bowlerId),
    ]);
    if (!batter) return 'batter';
    if (!bowler) return 'bowler';
    return null;
  }

  async getVersus(batterId: string, bowlerId: string): Promise<PlayerVersusDto | null> {
    const [batter, bowler, rows] = await Promise.all([
      this.repository.findPlayer(batterId),
      this.repository.findPlayer(bowlerId),
      this.repository.findMeetings(batterId, bowlerId),
    ]);
    if (!batter || !bowler) return null;

    const meetings = rows.map(this.toMeeting).filter(
      (meeting) => meeting.balls || meeting.runs || meeting.dismissals,
    );
    const total = (pick: (meeting: VersusMeetingDto) => number) =>
      meetings.reduce((sum, meeting) => sum + pick(meeting), 0);

    const balls = total((meeting) => meeting.balls);
    const runs = total((meeting) => meeting.runs);
    const dismissals = total((meeting) => meeting.dismissals);

    return {
      batter: this.toPlayer(batter),
      bowler: this.toPlayer(bowler),
      matches: meetings.length,
      balls,
      runs,
      fours: total((meeting) => meeting.fours),
      sixes: total((meeting) => meeting.sixes),
      dismissals,
      strike_rate: battingStrikeRate(runs, balls),
      first_match: meetings.at(0)?.start_date ?? null,
      last_match: meetings.at(-1)?.start_date ?? null,
      summary: this.summary(meetings.length, balls, runs, dismissals),
      coverage: COVERAGE,
      meetings,
      // Deliveries only ever come from SofaScore, so one bucket covers every meeting.
      sources: summarise(
        meetings.map(() => ({ source: SourceSystem.Sofascore })),
        PLAYER_VERSUS_NOTE,
      ),
    };
  }

  private toPlayer(row: VersusPlayerRow): VersusPlayerDto {
    return {
      id: row.id,
      ...sourceRef(row.source),
      name: row.name,
      identity_glued: toBool(row.identity_glued),
    };
  }

  private toMeeting(row: MeetingRow): VersusMeetingDto {
    const balls = toIntOrZero(row.balls);
    const runs = toIntOrZero(row.runs);
    const dismissals = toIntOrZero(row.dismissals);
    return {
      match_id: row.match_id,
      start_date: row.start_date,
      format: row.format,
      competition: row.competition,
      balls,
      runs,
      fours: toIntOrZero(row.fours),
      sixes: toIntOrZero(row.sixes),
      dismissals,
      summary: dismissals ? `${runs} (${balls}), out` : `${runs} (${balls})`,
    };
  }

  private summary(matches: number, balls: number, runs: number, dismissals: number): string {
    const plural = (value: number, singular: string, many: string) =>
      `${value} ${value === 1 ? singular : many}`;
    return [
      plural(matches, 'match', 'matches'),
      `${balls} balls`,
      `${runs} runs`,
      plural(dismissals, 'dismissal', 'dismissals'),
    ].join(', ');
  }
}
