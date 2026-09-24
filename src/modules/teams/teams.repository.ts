import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Numeric } from 'src/common/formatting/numbers';
import { SourceCountRow, sourceCountSelects } from 'src/common/provenance/source.util';
import { Match, MatchTeam, Team } from 'src/database/entities';
import { MatchFormat, MatchStatus } from 'src/database/enums/cricket.enums';
import { Repository } from 'typeorm';

export interface TeamRow {
  team_id: string;
  source: string;
  name: string;
  short_name: string | null;
  country: string | null;
  gender: string | null;
  is_national: boolean | null;
  sofa_id: number | null;
}

export interface FormatRecordRow extends SourceCountRow {
  format: string;
  played: Numeric;
  won: Numeric;
  lost: Numeric;
  drawn: Numeric;
  tied: Numeric;
  no_result: Numeric;
}

@Injectable()
export class TeamsRepository {
  constructor(
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
  ) {}

  findTeam(teamId: string): Promise<TeamRow | null> {
    return this.teams
      .createQueryBuilder('t')
      .select('CAST(t.teamId AS text)', 'team_id')
      .addSelect('CAST(t.rowSource AS text)', 'source')
      .addSelect('t.name', 'name')
      .addSelect('t.shortName', 'short_name')
      .addSelect('t.country', 'country')
      .addSelect('CAST(t.gender AS text)', 'gender')
      .addSelect('t.isNational', 'is_national')
      .addSelect('t.sofaId', 'sofa_id')
      .where('t.teamId = CAST(:teamId AS uuid)', { teamId })
      .getRawOne<TeamRow>()
      .then((row) => row ?? null);
  }

  formatRecords(teamId: string, format: MatchFormat | null): Promise<FormatRecordRow[]> {
    const qb = this.matches
      .createQueryBuilder('m')
      .select('CAST(m.format AS text)', 'format')
      .addSelect('count(*)', 'played')
      .addSelect('count(*) FILTER (WHERE m.winner_team_id = CAST(:teamId AS uuid))', 'won')
      .addSelect(
        `count(*) FILTER (
           WHERE m.winner_team_id IS NOT NULL
             AND m.winner_team_id <> CAST(:teamId AS uuid)
         )`,
        'lost',
      )
      .addSelect(
        "count(*) FILTER (WHERE m.result_type = 'drawn' AND m.winner_team_id IS NULL)",
        'drawn',
      )
      .addSelect(
        "count(*) FILTER (WHERE m.result_type = 'tied' AND m.winner_team_id IS NULL)",
        'tied',
      )
      .addSelect(
        `count(*) FILTER (
           WHERE m.winner_team_id IS NULL
             AND m.result_type IS DISTINCT FROM 'drawn'
             AND m.result_type IS DISTINCT FROM 'tied'
         )`,
        'no_result',
      )
      .innerJoin(MatchTeam, 'mt', 'mt.matchId = m.matchId AND mt.teamId = CAST(:teamId AS uuid)')
      .where('m.status = :status', { status: MatchStatus.Completed })
      .setParameter('teamId', teamId)
      .groupBy('m.format');

    for (const [expression, alias] of sourceCountSelects('m.row_source')) {
      qb.addSelect(expression, alias);
    }

    if (format) {
      qb.andWhere('m.format = CAST(:format AS cricket.match_format)', { format });
    }
    return qb.getRawMany<FormatRecordRow>();
  }
}
