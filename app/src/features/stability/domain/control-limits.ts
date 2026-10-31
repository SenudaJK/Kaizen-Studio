import type { IsoDate } from "@/lib/dates";

/** Fewest readings before limits mean anything; below this the chart shows points only. */
export const MIN_POINTS_FOR_LIMITS = 5;

/** How many of the most recent readings the chart and its limits are built from. */
export const CHART_WINDOW = 30;

/** Individuals (I-MR) chart constant: UCL/LCL = mean ± 2.66 × average moving range. */
const MR_FACTOR = 2.66;

export interface SpcReading {
  id: string;
  date: IsoDate;
  value: number;
  note: string | null;
}

export interface ControlLimits {
  mean: number;
  ucl: number;
  /** Floored at 0: none of the personal metrics we track can go negative. */
  lcl: number;
}

export interface ChartPoint extends SpcReading {
  /** Outside the control limits: a Special Cause, not everyday noise. */
  isSpecialCause: boolean;
}

export interface ControlChartResult {
  points: ChartPoint[];
  /** Null until there are enough readings to say what "normal" looks like. */
  limits: ControlLimits | null;
}

const average = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/**
 * Limits from the readings' own day-to-day movement (average moving range) rather than their
 * overall spread, so one wild day doesn't stretch the limits wide enough to hide itself.
 * Returns null when there are too few readings.
 */
export function controlLimits(values: readonly number[]): ControlLimits | null {
  if (values.length < MIN_POINTS_FOR_LIMITS) return null;
  const mean = average(values);
  const movingRanges = values.slice(1).map((v, i) => Math.abs(v - values[i]));
  const spread = MR_FACTOR * average(movingRanges);
  return { mean, ucl: mean + spread, lcl: Math.max(0, mean - spread) };
}

/** Sorts oldest to newest, keeps the latest `CHART_WINDOW`, computes limits and flags Special Causes. */
export function buildControlChart(readings: readonly SpcReading[]): ControlChartResult {
  const recent = readings.toSorted((a, b) => a.date.localeCompare(b.date)).slice(-CHART_WINDOW);
  const limits = controlLimits(recent.map((r) => r.value));
  const points = recent.map((r): ChartPoint => ({
    ...r,
    isSpecialCause: limits !== null && (r.value > limits.ucl || r.value < limits.lcl),
  }));
  return { points, limits };
}

export type SpecDirection = "MIN" | "MAX";

/** A reading meets the spec when it is at/above a minimum or at/below a maximum. */
export function meetsSpec(value: number, specLimit: number, direction: SpecDirection): boolean {
  return direction === "MIN" ? value >= specLimit : value <= specLimit;
}

export interface SpecSummary {
  met: number;
  total: number;
  /** Share of readings on target, 0–1; null with no readings. */
  ratio: number | null;
}

export function summarizeSpec(values: readonly number[], specLimit: number, direction: SpecDirection): SpecSummary {
  const met = values.filter((v) => meetsSpec(v, specLimit, direction)).length;
  return { met, total: values.length, ratio: values.length === 0 ? null : met / values.length };
}

export interface SliderRange {
  min: number;
  max: number;
  step: number;
}

/** A readable step for the spec slider, picked from the size of the numbers involved. */
function stepFor(span: number): number {
  if (span <= 5) return 0.1;
  if (span <= 50) return 0.5;
  if (span <= 500) return 5;
  return 10;
}

/**
 * Slider bounds derived from the data (never stored): wide enough to cover every reading and the
 * current target, with some room either side so the target can be pushed past the data.
 */
export function specSliderRange(values: readonly number[], specLimit: number): SliderRange {
  const all = [...values, specLimit];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = Math.max((hi - lo) * 0.25, hi === lo ? Math.max(Math.abs(hi) * 0.25, 1) : 0);
  const step = stepFor(hi - lo + 2 * pad);
  const min = Math.max(0, Math.floor((lo - pad) / step) * step);
  const max = Math.ceil((hi + pad) / step) * step;
  return { min: round(min, step), max: round(max, step), step };
}

/** Trims float noise like 6.300000000000001 without hiding legitimate decimals. */
export function round(value: number, step = 0.1): number {
  const decimals = step < 1 ? 1 : 0;
  return Number(value.toFixed(decimals));
}
