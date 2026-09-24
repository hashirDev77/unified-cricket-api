import { ResponseSourcesDto, SourceCountDto } from 'src/common/dto/source.dto';
import { Numeric, toIntOrZero } from 'src/common/formatting/numbers';
import { SourceSystem } from 'src/database/enums/cricket.enums';

export const SOURCE_LABELS: Readonly<Record<string, string>> = {
  [SourceSystem.Daft]: 'DAFT',
  [SourceSystem.Sofascore]: 'SofaScore',
  [SourceSystem.Merged]: 'Merged (DAFT + SofaScore)',
  [SourceSystem.Manual]: 'Manual',
};

export function sourceLabel(source: string | null | undefined): string | null {
  if (!source) return null;
  return SOURCE_LABELS[source] ?? source;
}

/** The two fields every entity block carries. */
export interface SourceRef {
  source: string | null;
  source_label: string | null;
}

export function sourceRef(source: string | null | undefined): SourceRef {
  return { source: source ?? null, source_label: sourceLabel(source) };
}

function toSummary(tally: Map<string, number>, note: string): ResponseSourcesDto {
  const breakdown: SourceCountDto[] = [...tally.entries()]
    .filter(([, rows]) => rows > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([source, rows]) => ({ source, source_label: sourceLabel(source) as string, rows }));

  return {
    primary: breakdown[0]?.source ?? null,
    primary_label: breakdown[0]?.source_label ?? null,
    blended: breakdown.length > 1,
    breakdown,
    note,
  };
}

/** Tallies the `source` values rows already carry, so list endpoints need no extra query. */
export function summarise(
  rows: readonly { source?: string | null }[],
  note: string,
): ResponseSourcesDto {
  const tally = new Map<string, number>();
  for (const row of rows) {
    if (!row.source) continue;
    tally.set(row.source, (tally.get(row.source) ?? 0) + 1);
  }
  return toSummary(tally, note);
}

/** The `FILTER` columns an aggregate query selects to report its own source mix. */
export interface SourceCountRow {
  src_daft: Numeric;
  src_sofascore: Numeric;
  src_merged: Numeric;
  src_manual: Numeric;
}

/**
 * Selects one counting column per feed, so an aggregate can report its mix without a
 * second scan. `column` is the qualified `row_source` column to bucket on.
 */
export function sourceCountSelects(column: string): [string, keyof SourceCountRow][] {
  return Object.keys(SOURCE_LABELS).map((source) => [
    `count(*) FILTER (WHERE ${column} = '${source}')`,
    `src_${source}` as keyof SourceCountRow,
  ]);
}

/** For aggregates, where the counts come back from `FILTER` columns rather than rows. */
export function summariseCounts(row: SourceCountRow, note: string): ResponseSourcesDto {
  const tally = new Map<string, number>();
  for (const source of Object.keys(SOURCE_LABELS)) {
    tally.set(source, toIntOrZero(row[`src_${source}` as keyof SourceCountRow]));
  }
  return toSummary(tally, note);
}

/** Merges several summaries into one, keeping the caller's note. */
export function mergeSummaries(
  parts: readonly ResponseSourcesDto[],
  note: string,
): ResponseSourcesDto {
  const tally = new Map<string, number>();
  for (const part of parts) {
    for (const entry of part.breakdown) {
      tally.set(entry.source, (tally.get(entry.source) ?? 0) + entry.rows);
    }
  }
  return toSummary(tally, note);
}
