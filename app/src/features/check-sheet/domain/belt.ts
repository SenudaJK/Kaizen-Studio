/**
 * Belt rank: a long-term progress ladder borrowed from Six Sigma certification.
 * It is earned purely by checking habits off, so it only ever goes up.
 */
export interface BeltTier {
  name: string;
  /** Lifetime completed check-ins needed to reach this belt. */
  minCheckIns: number;
}

export const BELT_TIERS: readonly BeltTier[] = [
  { name: "White Belt", minCheckIns: 0 },
  { name: "Yellow Belt", minCheckIns: 25 },
  { name: "Green Belt", minCheckIns: 100 },
  { name: "Brown Belt", minCheckIns: 300 },
  { name: "Black Belt", minCheckIns: 750 },
];

export interface BeltProgress {
  current: BeltTier;
  next: BeltTier | null;
  /** 0–100 progress toward the next belt (100 at the top rank). */
  progressPct: number;
  checkInsToNext: number;
}

export function beltFor(checkIns: number): BeltProgress {
  const total = Math.max(0, checkIns);
  const index = BELT_TIERS.reduce((best, tier, i) => (total >= tier.minCheckIns ? i : best), 0);
  const current = BELT_TIERS[index];
  const next = BELT_TIERS[index + 1] ?? null;
  if (!next) return { current, next, progressPct: 100, checkInsToNext: 0 };

  const span = next.minCheckIns - current.minCheckIns;
  return {
    current,
    next,
    progressPct: Math.round(((total - current.minCheckIns) / span) * 100),
    checkInsToNext: next.minCheckIns - total,
  };
}
