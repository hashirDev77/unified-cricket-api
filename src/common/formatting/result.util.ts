import { Numeric, toInt } from './numbers';

export type OutcomeLetter = 'W' | 'L' | 'D' | 'T' | 'N';

export function marginPhrase(margin: Numeric, unit: string | null): string | null {
  const value = toInt(margin);
  if (value === null || !unit) return null;
  if (unit === 'innings') {
    return `by an innings and ${value} ${value === 1 ? 'run' : 'runs'}`;
  }
  const noun = value === 1 && unit.endsWith('s') ? unit.slice(0, -1) : unit;
  return `by ${value} ${noun}`;
}

export function resultSummary(
  resultType: string | null,
  winner: string | null,
  margin: Numeric,
  unit: string | null,
): string | null {
  if (resultType === 'drawn') return 'Match drawn';
  if (resultType === 'tied') return 'Match tied';
  if (resultType === 'no_result' || resultType === 'abandoned') return 'No result';
  if (resultType === null && !winner) return 'No result';

  if (winner) {
    const lead = resultType === 'awarded' ? `${winner} awarded the match` : `${winner} won`;
    const extra = marginPhrase(margin, unit);
    return extra ? `${lead} ${extra}` : lead;
  }
  return resultType;
}

export function outcomeLetter(
  resultType: string | null,
  winnerId: string | null,
  teamId: string,
): OutcomeLetter {
  if (resultType === 'drawn') return 'D';
  if (resultType === 'tied') return 'T';
  if (resultType === 'no_result' || resultType === 'abandoned') return 'N';
  if (winnerId !== null) return winnerId === teamId ? 'W' : 'L';
  return 'N';
}

export function sideSummary(
  letter: OutcomeLetter,
  opponent: string | null,
  margin: Numeric,
  unit: string | null,
): string {
  const other = opponent || 'unknown';
  switch (letter) {
    case 'D':
      return `Draw vs ${other}`;
    case 'T':
      return `Tied vs ${other}`;
    case 'N':
      return `No result vs ${other}`;
    default: {
      const lead = letter === 'W' ? `Beat ${other}` : `Lost to ${other}`;
      const extra = marginPhrase(margin, unit);
      return extra ? `${lead} ${extra}` : lead;
    }
  }
}

/** Oldest result first, matching the conventional left-to-right form guide. */
export function formString(matches: readonly { result: string }[]): string {
  return matches
    .map((match) => match.result)
    .reverse()
    .join('');
}
