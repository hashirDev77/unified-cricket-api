import { Numeric, toInt } from './numbers';

export function scoreLine(runs: Numeric, wickets: Numeric): string | null {
  const runsValue = toInt(runs);
  if (runsValue === null) return null;
  const wicketsValue = toInt(wickets);
  return wicketsValue === null ? `${runsValue}` : `${runsValue}/${wicketsValue}`;
}

export function battingLine(runs: Numeric, balls: Numeric, isOut: boolean): string | null {
  const runsValue = toInt(runs);
  if (runsValue === null) return null;
  const mark = isOut ? '' : '*';
  const ballsValue = toInt(balls);
  return ballsValue === null ? `${runsValue}${mark}` : `${runsValue}${mark} (${ballsValue})`;
}

export function highestScore(runs: Numeric, notOut: boolean): string | null {
  const runsValue = toInt(runs);
  if (runsValue === null) return null;
  return `${runsValue}${notOut ? '*' : ''}`;
}

export function bestFigures(wickets: Numeric, runs: Numeric): string | null {
  const wicketsValue = toInt(wickets);
  const runsValue = toInt(runs);
  if (wicketsValue === null || runsValue === null) return null;
  return `${wicketsValue}/${runsValue}`;
}
