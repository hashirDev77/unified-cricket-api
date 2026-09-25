import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { containsPattern, prefixPattern } from 'src/common/sql/like.util';
import { fetchPage, Page, PageWindow } from 'src/common/sql/page.util';
import { toSofaId } from 'src/common/sql/query.util';
import { wordRegex } from 'src/common/sql/word-regex.util';
import {
  Competition,
  CompetitionAlias,
  Match,
  MatchTeam,
  Player,
  PlayerAlias,
  Team,
  TeamAlias,
  Venue,
} from 'src/database/entities';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

/** `limit` and `offset` window each result group separately, not the total. */
export interface SearchTerms extends PageWindow {
  q: string;
  pattern: string;
  prefix: string;
  word: string;
  sofaId: number | null;
}

export interface PlayerHitRow {
  id: string;
  source: string;
  name: string;
  country: string | null;
  identity_glued: boolean;
  daft_player_key: string | null;
  sofa_id: number | null;
}

export interface TeamHitRow {
  id: string;
  source: string;
  name: string;
  country: string | null;
  gender: string | null;
  sofa_id: number | null;
}

export interface CompetitionHitRow {
  id: string;
  source: string;
  name: string;
  format: string;
  gender: string;
  sofa_id: number | null;
}

export interface VenueHitRow {
  id: string;
  source: string;
  name: string;
  city: string | null;
  country: string | null;
  sofa_id: number | null;
}

export interface MatchHitRow {
  id: string;
  source: string;
  start_date: string;
  format: string;
  status: string;
  competition: string | null;
  daft_match_id: string | null;
  sofa_id: number | null;
}

const NEVER = 'false';

@Injectable()
export class SearchRepository {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(Competition) private readonly competitions: Repository<Competition>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Venue) private readonly venues: Repository<Venue>,
  ) {}

  static terms(query: string, window: PageWindow): SearchTerms {
    return {
      q: query,
      pattern: containsPattern(query),
      prefix: prefixPattern(query),
      word: wordRegex(query),
      sofaId: toSofaId(query),
      ...window,
    };
  }

  findPlayers(terms: SearchTerms): Promise<Page<PlayerHitRow>> {
    const sofaMatch = terms.sofaId === null ? NEVER : 'p.sofaId = :sofaId';
    return this.pageOf<PlayerHitRow>(
      this.players
        .createQueryBuilder('p')
        .select('CAST(p.playerId AS text)', 'id')
        .addSelect('p.fullName', 'name')
        .addSelect('CAST(p.rowSource AS text)', 'source')
        .addSelect('p.countryAlpha2', 'country')
        .addSelect('(p.daft_player_key IS NOT NULL AND p.sofa_id IS NOT NULL)', 'identity_glued')
        .addSelect('p.daftPlayerKey', 'daft_player_key')
        .addSelect('p.sofaId', 'sofa_id')
        .where(
          `p.fullName ILIKE :pattern ESCAPE '\\'
           OR p.knownAs ILIKE :pattern ESCAPE '\\'
           OR p.daftPlayerKey ILIKE :pattern ESCAPE '\\'
           OR ${sofaMatch}
           OR p.playerId IN ${this.aliasSubQuery(PlayerAlias, 'playerAlias', 'playerId')}`,
        )
        .orderBy(
          `CASE
             WHEN lower(p.full_name) = lower(:q) THEN 0
             WHEN ${sofaMatch} OR p.daft_player_key = :q THEN 0
             WHEN lower(p.full_name) ~ :word OR lower(coalesce(p.known_as, '')) ~ :word THEN 1
             WHEN p.full_name ILIKE :prefix ESCAPE '\\' THEN 2
             ELSE 3
           END`,
        )
        .addOrderBy('p.fullName'),
      terms,
    );
  }

  findTeams(terms: SearchTerms): Promise<Page<TeamHitRow>> {
    const sofaMatch = terms.sofaId === null ? NEVER : 't.sofaId = :sofaId';
    return this.pageOf<TeamHitRow>(
      this.teams
        .createQueryBuilder('t')
        .select('CAST(t.teamId AS text)', 'id')
        .addSelect('t.name', 'name')
        .addSelect('CAST(t.rowSource AS text)', 'source')
        .addSelect('t.country', 'country')
        .addSelect('CAST(t.gender AS text)', 'gender')
        .addSelect('t.sofaId', 'sofa_id')
        .where(
          `t.name ILIKE :pattern ESCAPE '\\'
           OR ${sofaMatch}
           OR t.teamId IN ${this.aliasSubQuery(TeamAlias, 'teamAlias', 'teamId')}`,
        )
        .orderBy(
          `CASE
             WHEN lower(t.name) = lower(:q) THEN 0
             WHEN lower(t.name) ~ :word THEN 1
             WHEN t.name ILIKE :prefix ESCAPE '\\' THEN 2
             ELSE 3
           END`,
        )
        .addOrderBy('t.name'),
      terms,
    );
  }

  findCompetitions(terms: SearchTerms): Promise<Page<CompetitionHitRow>> {
    const sofaMatch = terms.sofaId === null ? NEVER : 'c.sofaId = :sofaId';
    return this.pageOf<CompetitionHitRow>(
      this.competitions
        .createQueryBuilder('c')
        .select('CAST(c.competitionId AS text)', 'id')
        .addSelect('c.name', 'name')
        .addSelect('CAST(c.rowSource AS text)', 'source')
        .addSelect('CAST(c.format AS text)', 'format')
        .addSelect('CAST(c.gender AS text)', 'gender')
        .addSelect('c.sofaId', 'sofa_id')
        .where(
          `c.name ILIKE :pattern ESCAPE '\\'
           OR ${sofaMatch}
           OR c.competitionId IN ${this.aliasSubQuery(
             CompetitionAlias,
             'competitionAlias',
             'competitionId',
           )}`,
        )
        .orderBy(
          `CASE
             WHEN lower(c.name) = lower(:q) THEN 0
             WHEN lower(c.name) ~ :word THEN 1
             WHEN c.name ILIKE :prefix ESCAPE '\\' THEN 2
             ELSE 3
           END`,
        )
        .addOrderBy('c.name'),
      terms,
    );
  }

  findVenues(terms: SearchTerms): Promise<Page<VenueHitRow>> {
    const sofaMatch = terms.sofaId === null ? NEVER : 'v.sofaId = :sofaId';
    return this.pageOf<VenueHitRow>(
      this.venues
        .createQueryBuilder('v')
        .select('CAST(v.venueId AS text)', 'id')
        .addSelect('v.name', 'name')
        .addSelect('CAST(v.rowSource AS text)', 'source')
        .addSelect('v.city', 'city')
        .addSelect('v.country', 'country')
        .addSelect('v.sofaId', 'sofa_id')
        .where(
          `v.name ILIKE :pattern ESCAPE '\\'
           OR v.city ILIKE :pattern ESCAPE '\\'
           OR ${sofaMatch}`,
        )
        .orderBy(
          `CASE
             WHEN lower(v.name) = lower(:q) THEN 0
             WHEN ${sofaMatch} THEN 0
             WHEN lower(v.name) ~ :word THEN 1
             WHEN v.name ILIKE :prefix ESCAPE '\\' THEN 2
             ELSE 3
           END`,
        )
        .addOrderBy('v.name'),
      terms,
    );
  }

  findMatches(terms: SearchTerms): Promise<Page<MatchHitRow>> {
    const sofaMatch = terms.sofaId === null ? NEVER : 'm.sofaId = :sofaId';
    const byTeamName = this.matches
      .createQueryBuilder()
      .subQuery()
      .select('teamSide.matchId')
      .from(MatchTeam, 'teamSide')
      .innerJoin(Team, 'sideTeam', 'sideTeam.teamId = teamSide.teamId')
      .where(`sideTeam.name ILIKE :pattern ESCAPE '\\'`)
      .getQuery();

    return this.pageOf<MatchHitRow>(
      this.matches
        .createQueryBuilder('m')
        .select('CAST(m.matchId AS text)', 'id')
        .addSelect('m.startDate', 'start_date')
        .addSelect('CAST(m.rowSource AS text)', 'source')
        .addSelect('CAST(m.format AS text)', 'format')
        .addSelect('CAST(m.status AS text)', 'status')
        .addSelect('c.name', 'competition')
        .addSelect('m.daftMatchId', 'daft_match_id')
        .addSelect('m.sofaId', 'sofa_id')
        .leftJoin(Competition, 'c', 'c.competitionId = m.competitionId')
        .where(`m.daftMatchId = :q OR ${sofaMatch} OR m.matchId IN ${byTeamName}`)
        .orderBy(`CASE WHEN m.daft_match_id = :q OR ${sofaMatch} THEN 0 ELSE 1 END`)
        .addOrderBy('m.startDate', 'DESC'),
      terms,
    );
  }

  private aliasSubQuery(
    entity: typeof PlayerAlias | typeof TeamAlias | typeof CompetitionAlias,
    alias: string,
    idProperty: string,
  ): string {
    return this.matches
      .createQueryBuilder()
      .subQuery()
      .select(`${alias}.${idProperty}`)
      .from(entity, alias)
      .where(`${alias}.aliasName ILIKE :pattern ESCAPE '\\'`)
      .getQuery();
  }

  private pageOf<TRow, TEntity extends ObjectLiteral = ObjectLiteral>(
    qb: SelectQueryBuilder<TEntity>,
    terms: SearchTerms,
  ): Promise<Page<TRow>> {
    qb.setParameters({
      q: terms.q,
      pattern: terms.pattern,
      prefix: terms.prefix,
      word: terms.word,
      ...(terms.sofaId === null ? {} : { sofaId: terms.sofaId }),
    });
    return fetchPage<TRow, TEntity>(qb, terms);
  }
}
