import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { batterDismissalCount, legalBallCount } from 'src/common/sql/delivery.sql';
import { Competition, Delivery, Innings, Match, Player } from 'src/database/entities';
import { Repository } from 'typeorm';

export interface VersusPlayerRow {
  id: string;
  source: string;
  name: string;
  identity_glued: boolean;
}

export interface MeetingRow {
  match_id: string;
  start_date: string;
  format: string;
  competition: string | null;
  balls: Numeric;
  runs: Numeric;
  fours: Numeric;
  sixes: Numeric;
  dismissals: Numeric;
}

@Injectable()
export class VersusRepository {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Delivery) private readonly deliveries: Repository<Delivery>,
  ) {}

  findPlayer(playerId: string): Promise<VersusPlayerRow | null> {
    return this.players
      .createQueryBuilder('p')
      .select('CAST(p.playerId AS text)', 'id')
      .addSelect('CAST(p.rowSource AS text)', 'source')
      .addSelect('p.fullName', 'name')
      .addSelect('(p.daft_player_key IS NOT NULL AND p.sofa_id IS NOT NULL)', 'identity_glued')
      .where('p.playerId = CAST(:playerId AS uuid)', { playerId })
      .getRawOne<VersusPlayerRow>()
      .then((row) => row ?? null);
  }

  findMeetings(batterId: string, bowlerId: string): Promise<MeetingRow[]> {
    return this.deliveries
      .createQueryBuilder('d')
      .select('CAST(m.matchId AS text)', 'match_id')
      .addSelect('m.startDate', 'start_date')
      .addSelect('CAST(m.format AS text)', 'format')
      .addSelect('c.name', 'competition')
      .addSelect(legalBallCount('d'), 'balls')
      .addSelect('coalesce(sum(d.runs_off_bat), 0)', 'runs')
      .addSelect('count(*) FILTER (WHERE d.runs_off_bat = 4)', 'fours')
      .addSelect('count(*) FILTER (WHERE d.runs_off_bat = 6)', 'sixes')
      .addSelect(batterDismissalCount('d'), 'dismissals')
      .innerJoin(Innings, 'i', 'i.inningsId = d.inningsId')
      .innerJoin(Match, 'm', 'm.matchId = i.matchId')
      .leftJoin(Competition, 'c', 'c.competitionId = m.competitionId')
      .where('d.batsmanId = CAST(:batterId AS uuid)', { batterId })
      .andWhere('d.bowlerId = CAST(:bowlerId AS uuid)', { bowlerId })
      .groupBy('m.matchId')
      .addGroupBy('m.startDate')
      .addGroupBy('m.format')
      .addGroupBy('c.name')
      .orderBy('m.startDate')
      .addOrderBy('m.matchId')
      .getRawMany<MeetingRow>();
  }
}
