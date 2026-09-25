import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const DEFAULT_OFFSET = 0;

export interface PageWindow {
  limit: number;
  offset: number;
}

export interface Page<T> {
  rows: T[];
  has_more: boolean;
}

/** Reads one row past the window, so `has_more` costs no second count query. */
export async function fetchPage<TRow, TEntity extends ObjectLiteral = ObjectLiteral>(
  qb: SelectQueryBuilder<TEntity>,
  window: PageWindow,
): Promise<Page<TRow>> {
  const rows = await qb
    .limit(window.limit + 1)
    .offset(window.offset)
    .getRawMany<TRow>();
  const hasMore = rows.length > window.limit;
  return { rows: hasMore ? rows.slice(0, window.limit) : rows, has_more: hasMore };
}

export function emptyPage<T>(): Page<T> {
  return { rows: [], has_more: false };
}

export function mapPage<T, U>(page: Page<T>, shape: (row: T) => U): Page<U> {
  return { rows: page.rows.map(shape), has_more: page.has_more };
}
