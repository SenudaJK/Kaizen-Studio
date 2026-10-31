import { addDays, startOfWeek, type IsoDate } from "@/lib/dates";

export type ParetoWindow = "week" | "month";

export const PARETO_WINDOWS: readonly ParetoWindow[] = ["week", "month"];

/** Unknown or missing `?range=` values fall back to the current week. */
export function resolveWindow(raw: string | string[] | undefined): ParetoWindow {
  return raw === "month" ? "month" : "week";
}

/** Inclusive day range a window covers: this week so far, or the last 30 days including today. */
export function windowRange(window: ParetoWindow, today: IsoDate): { from: IsoDate; to: IsoDate } {
  return { from: window === "week" ? startOfWeek(today) : addDays(today, -29), to: today };
}

export interface ParetoInput {
  id: string;
  name: string;
  count: number;
}

export interface ParetoBar extends ParetoInput {
  /** Running share of all slips including this bar, 0–100. Derived, never stored. */
  cumulativePct: number;
  /** True while the bar starts below the 80% line: these are the Vital Few. */
  isVital: boolean;
}

export interface ParetoResult {
  bars: ParetoBar[];
  total: number;
  vitalCount: number;
  /** Share of all slips the Vital Few account for, rounded, 0–100. */
  vitalPct: number;
}

/** Share of all slips the Vital Few should cover. */
export const PARETO_CUTOFF_PCT = 80;

/**
 * Ranks blockers by how often they were tallied and marks the Vital Few: every bar that
 * begins below the 80% cumulative line (so the bar that crosses the line is included).
 * Blockers with no tallies in the window are left out; there is nothing to rank.
 */
export function buildPareto(items: readonly ParetoInput[]): ParetoResult {
  const ranked = items
    .filter((item) => item.count > 0)
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const total = ranked.reduce((sum, item) => sum + item.count, 0);

  let running = 0;
  let vitalCount = 0;
  let vitalPct = 0;
  const bars = ranked.map((item): ParetoBar => {
    // Compare in whole counts (running * 100 < 80 * total) so there is no float edge at exactly 80%.
    const isVital = running * 100 < PARETO_CUTOFF_PCT * total;
    running += item.count;
    const cumulativePct = (running / total) * 100;
    if (isVital) {
      vitalCount += 1;
      vitalPct = Math.round(cumulativePct);
    }
    return { ...item, cumulativePct, isVital };
  });

  return { bars, total, vitalCount, vitalPct };
}
