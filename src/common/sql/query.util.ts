export const INT32_MAX = 2_147_483_647;

export const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Postgres integer id, or null when the key is not a valid `integer`. */
export function toSofaId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed <= INT32_MAX ? parsed : null;
}

export function groupBy<T, K extends string>(rows: readonly T[], key: (row: T) => K) {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    (acc[key(row)] ??= []).push(row);
    return acc;
  }, {});
}
