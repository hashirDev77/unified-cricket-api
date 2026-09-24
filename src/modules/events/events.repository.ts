import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { batterDismissalCount, legalBallCount } from 'src/common/sql/delivery.sql';
import { Batting, Delivery, Innings, Match, Player } from 'src/database/entities';
import { SourceSystem } from 'src/database/enums/cricket.enums';
import { Repository } from 'typeorm';

export interface EventRow {
  event_id: string;
  daft_match_id: string | null;
  sofa_id: number | null;
  has_deliveries: boolean;
  scorecard_source: SourceSystem | null;
}

export interface DeliveryDuelRow {
  batsman_id: string;
  batsman: string;
  bowler_id: string;
  bowler: string;
  balls: Numeric;
  runs: Numeric;
  fours: Numeric;
  sixes: Numeric;
  wickets: Numeric;
}

export interface WicketDuelRow {
  batsman_id: string;
  batsman: string;
  bowler_id: string;
  bowler: string;
  dismissal_type: string | null;
  fielder: string | null;
  is_out: boolean | null;
  did_not_bat: boolean;
}

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Delivery) private readonly deliveries: Repository<Delivery>,
    @InjectRepository(Batting) private readonly batting: Repository<Batting>,
  ) {}

  findEvent(matchId: string): Promise<EventRow | null> {
    return this.matches
      .createQueryBuilder('m')
      .select('CAST(m.matchId AS text)', 'event_id')
      .addSelect('m.daftMatchId', 'daft_match_id')
      .addSelect('m.sofaId', 'sofa_id')
      .addSelect('m.hasDeliveries', 'has_deliveries')
      .addSelect('CAST(m.scorecardSource AS text)', 'scorecard_source')
      .where('m.matchId = CAST(:matchId AS uuid)', { matchId })
      .getRawOne<EventRow>()
      .then((row) => row ?? null);
  }

  findDeliveryDuels(matchId: string): Promise<DeliveryDuelRow[]> {
    return this.deliveries
      .createQueryBuilder('d')
      .select('CAST(d.batsmanId AS text)', 'batsman_id')
      .addSelect('batsman.fullName', 'batsman')
      .addSelect('CAST(d.bowlerId AS text)', 'bowler_id')
      .addSelect('bowler.fullName', 'bowler')
      .addSelect(legalBallCount('d'), 'balls')
      .addSelect('coalesce(sum(d.runs_off_bat), 0)', 'runs')
      .addSelect('count(*) FILTER (WHERE d.runs_off_bat = 4)', 'fours')
      .addSelect('count(*) FILTER (WHERE d.runs_off_bat = 6)', 'sixes')
      .addSelect(batterDismissalCount('d'), 'wickets')
      .innerJoin(Innings, 'i', 'i.inningsId = d.inningsId')
      .innerJoin(Player, 'batsman', 'batsman.playerId = d.batsmanId')
      .innerJoin(Player, 'bowler', 'bowler.playerId = d.bowlerId')
      .where('i.matchId = CAST(:matchId AS uuid)', { matchId })
      .groupBy('d.batsmanId')
      .addGroupBy('batsman.fullName')
      .addGroupBy('d.bowlerId')
      .addGroupBy('bowler.fullName')
      .orderBy('runs', 'DESC')
      .addOrderBy('wickets', 'DESC')
      .addOrderBy('batsman.fullName')
      .addOrderBy('bowler.fullName')
      .getRawMany<DeliveryDuelRow>();
  }

  findWicketDuels(matchId: string, source: SourceSystem): Promise<WicketDuelRow[]> {
    return this.batting
      .createQueryBuilder('b')
      .select('CAST(p.playerId AS text)', 'batsman_id')
      .addSelect('p.fullName', 'batsman')
      .addSelect('CAST(bowler.playerId AS text)', 'bowler_id')
      .addSelect('bowler.fullName', 'bowler')
      .addSelect('b.dismissalType', 'dismissal_type')
      .addSelect('fielder.fullName', 'fielder')
      .addSelect('b.isOut', 'is_out')
      .addSelect('b.didNotBat', 'did_not_bat')
      .innerJoin(Innings, 'i', 'i.inningsId = b.inningsId')
      .innerJoin(Player, 'p', 'p.playerId = b.playerId')
      .innerJoin(Player, 'bowler', 'bowler.playerId = b.bowlerId')
      .leftJoin(Player, 'fielder', 'fielder.playerId = b.fielderId')
      .where('i.matchId = CAST(:matchId AS uuid)')
      .andWhere('b.rowSource = CAST(:source AS cricket.source_system)')
      .andWhere('b.isOut')
      .setParameters({ matchId, source })
      .orderBy('i.inningsNumber')
      .addOrderBy('b.battingPosition', 'ASC', 'NULLS LAST')
      .getRawMany<WicketDuelRow>();
  }
}
