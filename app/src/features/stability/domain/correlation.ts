import type { IsoDate } from "@/lib/dates";

/** Fewest paired days before a correlation is worth reporting. */
export const MIN_PAIRS = 5;

export interface Reading {
  date: IsoDate;
  value: number;
}

export interface Pair {
  date: IsoDate;
  x: number;
  y: number;
}

/** Days on which both metrics were logged, oldest first. The scatter only compares like with like. */
export function pairByDate(xs: readonly Reading[], ys: readonly Reading[]): Pair[] {
  const yByDate = new Map(ys.map((r) => [r.date, r.value]));
  return xs
    .filter((r) => yByDate.has(r.date))
    .map((r) => ({ date: r.date, x: r.value, y: yByDate.get(r.date) as number }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

export interface Fit {
  n: number;
  /** Pearson correlation, -1 to 1. */
  r: number;
  /** Share of the variation in Y that X explains, 0–1. */
  rSquared: number;
  slope: number;
  intercept: number;
}

/** Least-squares line and Pearson r. Null when there are too few pairs or X (or Y) never varies. */
export function linearFit(pairs: readonly Pair[]): Fit | null {
  const n = pairs.length;
  if (n < MIN_PAIRS) return null;

  const meanX = pairs.reduce((s, p) => s + p.x, 0) / n;
  const meanY = pairs.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of pairs) {
    sxx += (p.x - meanX) ** 2;
    syy += (p.y - meanY) ** 2;
    sxy += (p.x - meanX) * (p.y - meanY);
  }
  if (sxx === 0 || syy === 0) return null;

  const r = sxy / Math.sqrt(sxx * syy);
  const slope = sxy / sxx;
  return { n, r, rSquared: r * r, slope, intercept: meanY - slope * meanX };
}

export type Strength = "strong" | "moderate" | "weak" | "none";

/** Everyday cut-offs on |r|; there is no single official scale, these are the common ones. */
export function strengthOf(r: number): Strength {
  const size = Math.abs(r);
  if (size >= 0.7) return "strong";
  if (size >= 0.4) return "moderate";
  if (size >= 0.2) return "weak";
  return "none";
}

export type Direction = "positive" | "negative";

export const directionOf = (r: number): Direction => (r >= 0 ? "positive" : "negative");

export function formatR(r: number): string {
  return `${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(2)}`;
}

export interface TakeawayInput {
  fit: Fit;
  xName: string;
  yName: string;
  xUnit: string;
  yUnit: string;
}

const sig = (value: number) => (Math.abs(value) >= 10 ? value.toFixed(0) : Math.abs(value) >= 1 ? value.toFixed(1) : value.toFixed(2));

/**
 * One plain sentence about what the scatter says, plus the caveat that a pattern is a lead to test
 * rather than proof of cause. Wording follows the strength so a weak link is never oversold.
 */
export function describeCorrelation({ fit, xName, yName, xUnit, yUnit }: TakeawayInput): { title: string; detail: string } {
  const strength = strengthOf(fit.r);
  if (strength === "none") {
    return {
      title: `No clear link between ${xName} and ${yName}.`,
      detail: "The points don't line up, so changing one is unlikely to move the other. Look for a different upstream factor.",
    };
  }

  const verb = fit.r > 0 ? "go up" : "go down";
  const lead = strength === "weak" ? "A faint pattern: " : "";
  const title = `${lead}When ${xName} rises, ${yName} tends to ${verb}.`;
  const slope = `Each extra ${xUnit ? `${xUnit} of ` : ""}${xName} goes with about ${sig(Math.abs(fit.slope))}${yUnit ? ` ${yUnit}` : ""} ${fit.r > 0 ? "more" : "less"} ${yName}.`;
  return {
    title,
    detail: `${slope} It's a lead worth testing, not proof that one causes the other.`,
  };
}
