import type { FrictionTriggerDto } from "../types";

export interface TopTrigger {
  name: string;
  count: number;
  /** Share of all blockers this week, 0–100. */
  sharePct: number;
}

/** The blocker responsible for the biggest share of this week's slips, if any were logged. */
export function topTrigger(triggers: readonly FrictionTriggerDto[]): TopTrigger | null {
  const total = triggers.reduce((sum, t) => sum + t.weekCount, 0);
  if (total === 0) return null;
  const top = triggers.reduce((best, t) => (t.weekCount > best.weekCount ? t : best));
  return { name: top.name, count: top.weekCount, sharePct: Math.round((top.weekCount / total) * 100) };
}
