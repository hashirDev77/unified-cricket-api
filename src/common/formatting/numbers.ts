/** `bigint` and `numeric` arrive from node-pg as strings, so every count and sum is widened. */
export type Numeric = number | string | null | undefined;

export function toInt(value: Numeric): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function toIntOrZero(value: Numeric): number {
  return toInt(value) ?? 0;
}

export function toFloat(value: Numeric): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

/** Mirrors Python truthiness: null, undefined and 0 are all absent. */
export function isNonZero(value: Numeric): boolean {
  const parsed = toFloat(value);
  return parsed !== null && parsed !== 0;
}

export function toBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 't' || value === 1;
}
