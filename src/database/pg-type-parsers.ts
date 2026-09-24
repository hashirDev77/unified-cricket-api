import { types } from 'pg';

const PG_DATE = 1082;
const PG_TIMESTAMPTZ = 1184;

let applied = false;

/** `2014-07-31T19:00:00.000Z` -> `2014-07-31T19:00:00Z`, matching Pydantic. */
function toIsoUtc(value: string): string {
  const iso = new Date(value).toISOString();
  return iso.endsWith('.000Z') ? `${iso.slice(0, -5)}Z` : iso;
}

/**
 * `date` must stay a raw `YYYY-MM-DD` string. The default parser builds a JS
 * Date at local midnight, which shifts the day for any negative UTC offset.
 */
export function applyPgTypeParsers(): void {
  if (applied) return;
  types.setTypeParser(PG_DATE, (value: string) => value);
  types.setTypeParser(PG_TIMESTAMPTZ, toIsoUtc);
  applied = true;
}
