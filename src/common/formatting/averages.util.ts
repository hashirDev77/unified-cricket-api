import { isNonZero, Numeric, round, toInt } from './numbers';

export function spellEconomy(
  runs: Numeric,
  legalBalls: Numeric,
  ballsPerOver: Numeric,
): number | null {
  const runsValue = toInt(runs);
  if (runsValue === null || !isNonZero(legalBalls) || !isNonZero(ballsPerOver)) return null;
  const overs = toInt(legalBalls)! / toInt(ballsPerOver)!;
  return overs === 0 ? null : round(runsValue / overs);
}

export function battingAverage(runs: Numeric, outs: Numeric): number | null {
  if (!isNonZero(outs)) return null;
  return round(toInt(runs)! / toInt(outs)!);
}

export function battingStrikeRate(runsWithBalls: Numeric, balls: Numeric): number | null {
  if (!isNonZero(balls)) return null;
  return round((toInt(runsWithBalls)! / toInt(balls)!) * 100);
}

export function bowlingAverage(runs: Numeric, wickets: Numeric): number | null {
  if (!isNonZero(wickets)) return null;
  return round(toInt(runs)! / toInt(wickets)!);
}

export function bowlingEconomy(runs: Numeric, oversDecimal: Numeric): number | null {
  if (!isNonZero(oversDecimal)) return null;
  return round(toInt(runs)! / Number(oversDecimal));
}

export function bowlingStrikeRate(legalBalls: Numeric, wickets: Numeric): number | null {
  if (!isNonZero(wickets)) return null;
  return round(toInt(legalBalls)! / toInt(wickets)!);
}
