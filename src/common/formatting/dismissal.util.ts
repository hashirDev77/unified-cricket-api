export interface DismissalInput {
  didNotBat: boolean;
  isOut: boolean;
  dismissalType: string | null;
  bowler: string | null;
  fielder: string | null;
}

function join(...parts: (string | null)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(' ');
}

export function dismissalText({
  didNotBat,
  isOut,
  dismissalType,
  bowler,
  fielder,
}: DismissalInput): string {
  if (didNotBat) return 'did not bat';
  if (!isOut) return 'not out';

  const kind = dismissalType || 'out';
  switch (kind) {
    case 'c':
      return join('c', fielder, 'b', bowler);
    case 'c and b':
      return bowler ? `c and b ${bowler}` : 'c and b';
    case 'bowled':
      return bowler ? `b ${bowler}` : 'bowled';
    case 'lbw':
      return bowler ? `lbw b ${bowler}` : 'lbw';
    case 'st':
      return join('st', fielder, 'b', bowler);
    case 'run out':
      return fielder ? `run out (${fielder})` : 'run out';
    case 'hit wkt':
      return bowler ? `hit wicket b ${bowler}` : 'hit wicket';
    default:
      return kind;
  }
}
