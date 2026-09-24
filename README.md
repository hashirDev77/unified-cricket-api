# Unified Cricket API (NestJS)

Read-only HTTP API over the `cricket` schema of `cricket_unified`. This is a NestJS + TypeORM
port of the FastAPI service in `../cricket-unified-api`, reproducing its routes and payloads and
adding a few query endpoints of its own.

## Endpoints

Ported from the FastAPI service, payload for payload:

| Method | Path | Description |
| --- | --- | --- |
| GET | `/v1/search?q=&limit=` | Players, teams, competitions, venues and matches ranked by name match |
| GET | `/v1/matches/:matchId` | Full match page: scorecard, awards, recent form, head-to-head |
| GET | `/v1/players/:playerId?format=&limit=` | Career batting and bowling summary plus recent innings |
| GET | `/v1/players/:batterId/versus/:bowlerId` | Ball-by-ball record between two players |
| GET | `/v1/teams/:teamId?format=&limit=` | Per-format win/loss record, form and recent matches |
| GET | `/v1/cricket/event/:eventId/h2h` | Batter-versus-bowler matchups inside one match |
| GET | `/health` | Liveness probe backed by a database round trip |

Nest-only additions, all returning the same `MatchSummaryDto` rows:

| Method | Path | Description |
| --- | --- | --- |
| GET | `/v1/teams/:teamAId/versus/:teamBId` | Win/loss record between two teams plus the meetings |
| GET | `/v1/matches` | Most recent matches, by venue country and format |
| GET | `/v1/venues/:venueId/matches` | Matches at one venue, narrowable to a single match |

Path ids accept three forms: the canonical uuid, the SofaScore integer id, or the DAFT text key
(`daft_match_id` for matches, `daft_player_key` for players). Teams have no DAFT key, so only the
first two work there. Venues accept a uuid, a SofaScore id or a name; only 3 of 1,495 venues carry
a SofaScore id, and names repeat across countries, so a name resolves to the ground with the most
matches.

`format` accepts one of `test`, `first_class`, `odi`, `list_a`, `t20i`, `t20`, `t10`, `hundred`,
`exhibition`, `other`.

`limit` is an integer between 1 and 100 that sizes the list portion of the response:
`recent_matches` on the team page (which also lengthens `form`), `recent_innings` on the player
page, and each result group on search. It is an extension over the FastAPI service; omitting it
reproduces that service's fixed sizes of 5, 10 and 10 respectively. On the three Nest-only
endpoints it defaults to 20.

Swagger UI is served at `/docs`.

## Source provenance

The database unifies two feeds, so every response says which one it came from. Each entity block
carries `source` (`daft`, `sofascore`, `merged` or `manual`) alongside a display `source_label`,
and every endpoint carries a top-level `sources` summary with the winning feed, a per-feed row
count and a note describing how that endpoint is fed.

List endpoints tally the labels their rows already carry, so the summary costs no extra query.
Aggregate endpoints — the player career totals, the per-format team record and the head-to-head
counter — add `count(*) FILTER (WHERE row_source = ...)` columns to the scan they already run.

Two things read as source but are not. `scorecard.source` on the match page names the feed that
supplied the scorecard specifically, and is mirrored by `scorecard.source_label`. The top-level
`source` on `/v1/cricket/event/{id}/h2h` names which table the matchups were derived from
(`deliveries` or `wickets`), not a feed; its `sources` block carries the provenance. Ball-by-ball
deliveries exist only on the SofaScore side, so anything derived from them is SofaScore-only.

## Running

```bash
cp .env.example .env     # set DATABASE_URL
npm install
npm run start:dev
```

The pool opens every connection with `search_path=cricket,public` and
`default_transaction_read_only=on`, so the service cannot write to the database.

## Layout

```
src/
  config/      environment schema (zod) and the global config module
  database/    cricket enums, entities, read-only DataSource, pg type parsers
  common/      formatting helpers, SQL fragment helpers, shared DTOs and filters
    provenance/  source labels, per-endpoint notes, summary builders
  modules/
    identity/   uuid / SofaScore id / DAFT key resolution
    records/    recent team matches, form strings, head-to-head (shared)
    match-list/ the one filterable match-summary query (shared)
    search/ matches/ players/ teams/ venues/ events/ health/
```

Each feature module is a controller (routing and validation), a service (row to DTO shaping),
and a repository (TypeORM QueryBuilder). Repositories return raw typed rows; all number
formatting and cricket notation lives in `common/formatting` as pure functions.

## Verifying parity against the FastAPI service

`./verify-parity.sh` boots both APIs against the same database and compares the body and status
code of every path in `verify-paths.txt`. Paths listed in `verify-nest-only.txt` exist only here,
so they are checked for status and shape instead of being diffed.

Four normalisations are applied, none of them behavioural. Python renders whole floats as `16.0`
where JavaScript renders `16`; the two parse to the same double. The provenance fields are
additions the FastAPI service never had, so `sources`, `source` and `source_label` are dropped —
except on the scorecard and the events matchups, where `source` predates provenance and is
compared. The match search orders only by rank and `start_date`, so rows sharing a date come back
from Postgres in arbitrary order on either API. And `/v1/search` gained a `venues` block that the
FastAPI service has no equivalent for, so that key is dropped before the two bodies are compared.

## Notes on data handling

- `count(*)` and `sum(...)` come back from node-pg as strings, so every aggregate is widened
  through `toInt` / `toFloat` before it reaches a DTO.
- `date` columns keep their raw `YYYY-MM-DD` form; the default pg parser would build a local-time
  `Date` and shift the day west of UTC.
- Overs are stored as `legal_balls` plus `balls_per_over` and rendered with
  `cricket.overs_display`. `67.3` means 67 overs and 3 balls, not a decimal.
