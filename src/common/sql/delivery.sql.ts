/**
 * Wides, leg byes and byes are not credited to the batter, so they are excluded
 * from any ball count derived from `cricket.delivery`.
 */
export function legalBallFilter(alias: string): string {
  return `NOT (
    coalesce(${alias}.incident_class_label, '') LIKE 'Wd%'
    OR coalesce(${alias}.incident_class_label, '') LIKE 'Lb%'
    OR coalesce(${alias}.incident_class_label, '') ~ '^B[0-9]'
  )`;
}

export function legalBallCount(alias: string): string {
  return `count(*) FILTER (WHERE ${legalBallFilter(alias)})`;
}

export function batterDismissalCount(alias: string): string {
  return `count(*) FILTER (WHERE ${alias}.is_wicket AND ${alias}.dismissed_id = ${alias}.batsman_id)`;
}
