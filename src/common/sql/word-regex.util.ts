const POSIX_SPECIAL = /[.^$*+?()[\]{}|\\-]/g;

/** POSIX word-boundary pattern for Postgres `~`; `\b` is not available there. */
export function wordRegex(query: string): string {
  const escaped = query.toLowerCase().replace(POSIX_SPECIAL, '\\$&');
  return `(^|[^[:alnum:]])${escaped}([^[:alnum:]]|$)`;
}
