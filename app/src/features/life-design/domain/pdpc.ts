export interface Coverage {
  /** Risks you've named. */
  total: number;
  /** Risks whose countermeasure is switched on. */
  covered: number;
  /** Risks with no active backup plan. */
  exposed: number;
  /** Whole percent of risks covered; 0 when there are no risks yet. */
  percent: number;
}

/** How much of the foreseen trouble already has a standing backup plan. */
export function coverage(scenarios: readonly { active: boolean }[]): Coverage {
  const total = scenarios.length;
  const covered = scenarios.filter((s) => s.active).length;
  return { total, covered, exposed: total - covered, percent: total === 0 ? 0 : Math.round((covered / total) * 100) };
}

/** Coverage across every pillar of the plan. */
export function planCoverage(pillars: readonly { scenarios: readonly { active: boolean }[] }[]): Coverage {
  return coverage(pillars.flatMap((p) => p.scenarios));
}
