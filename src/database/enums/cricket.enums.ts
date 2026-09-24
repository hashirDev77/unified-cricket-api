export enum SourceSystem {
  Daft = 'daft',
  Sofascore = 'sofascore',
  Merged = 'merged',
  Manual = 'manual',
}

export enum SourceOnly {
  Daft = 'daft',
  Sofascore = 'sofascore',
}

export enum Gender {
  Men = 'men',
  Women = 'women',
}

export enum MatchFormat {
  Test = 'test',
  FirstClass = 'first_class',
  Odi = 'odi',
  ListA = 'list_a',
  T20i = 't20i',
  T20 = 't20',
  T10 = 't10',
  Hundred = 'hundred',
  Exhibition = 'exhibition',
  Other = 'other',
}

export enum MatchStatus {
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  Interrupted = 'interrupted',
  Completed = 'completed',
  Abandoned = 'abandoned',
  Cancelled = 'cancelled',
}

export enum ResultType {
  Won = 'won',
  Drawn = 'drawn',
  Tied = 'tied',
  NoResult = 'no_result',
  Abandoned = 'abandoned',
  Awarded = 'awarded',
  BowlOut = 'bowl_out',
  SuperOver = 'super_over',
}

export enum WinMarginUnit {
  Runs = 'runs',
  Wickets = 'wickets',
  Innings = 'innings',
}

export enum TossDecision {
  Bat = 'bat',
  Field = 'field',
}

export enum Hand {
  Right = 'right',
  Left = 'left',
}

export enum ResolutionMethod {
  DobConfirmed = 'dob_confirmed',
  ExactName = 'exact_name',
  SingleCandidate = 'single_candidate',
  Alias = 'alias',
  DateTeamPair = 'date_team_pair',
  Manual = 'manual',
  SourceOnly = 'source_only',
}

export enum ResolutionConfidence {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Manual = 'manual',
}

/** Declaration order of `cricket.match_format`, used to sort per-format records. */
export const MATCH_FORMAT_ORDER: readonly MatchFormat[] = [
  MatchFormat.Test,
  MatchFormat.FirstClass,
  MatchFormat.Odi,
  MatchFormat.ListA,
  MatchFormat.T20i,
  MatchFormat.T20,
  MatchFormat.T10,
  MatchFormat.Hundred,
  MatchFormat.Exhibition,
  MatchFormat.Other,
];

const FORMAT_RANK = new Map<string, number>(
  MATCH_FORMAT_ORDER.map((format, index) => [format as string, index]),
);

export function formatSortKey(format: string): number {
  return FORMAT_RANK.get(format) ?? 99;
}
