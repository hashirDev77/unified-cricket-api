/** Companion to `ESCAPE '\'` on every ILIKE predicate. */
function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function containsPattern(value: string): string {
  return `%${escapeLike(value)}%`;
}

export function prefixPattern(value: string): string {
  return `${escapeLike(value)}%`;
}
