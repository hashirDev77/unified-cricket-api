/**
 * One line per endpoint describing how the unified database feeds it, echoed back in
 * `sources.note` so a response explains its own provenance.
 */
export const MATCH_PAGE_NOTE =
  'Fixture, scorecard and awards. Historic matches come from DAFT; recent and live fixtures come from SofaScore, and matched fixtures are merged.';

export const MATCH_LIST_NOTE =
  'Fixture rows only. The bulk is DAFT, with SofaScore covering recent and live matches and merged rows where both feeds agree on a fixture.';

export const VENUE_MATCHES_NOTE =
  'Venue plus its fixture rows. Venues are almost entirely DAFT; the fixtures mix DAFT history with SofaScore coverage of recent seasons.';

export const HEAD_TO_HEAD_NOTE =
  'Completed meetings between two teams. The record counts DAFT history and SofaScore recent seasons together.';

export const SEARCH_NOTE =
  'Name and source-id lookups across both feeds. Each hit carries the feed that owns that row.';

export const PLAYER_PAGE_NOTE =
  'Career aggregates built from scorecards. Batting and bowling totals are predominantly DAFT, with SofaScore contributing recent seasons.';

export const TEAM_PAGE_NOTE =
  'Team profile with per-format records. Teams are mostly DAFT; the records span both feeds.';

export const PLAYER_VERSUS_NOTE =
  'Aggregated from individual deliveries, which only the SofaScore feed supplies.';

export const DUELS_NOTE =
  'Batter-versus-bowler matchups. Ball-by-ball deliveries are SofaScore only; the wicket fallback reads DAFT scorecards.';
