import type { SpecDirection } from "./types";

/** Optional one-click suggestions for a new user. Nothing is seeded automatically. */
export interface StarterMetric {
  name: string;
  unit: string;
  specLimit: number;
  specDirection: SpecDirection;
}

export const STARTER_METRICS: readonly StarterMetric[] = [
  { name: "Sleep", unit: "hrs", specLimit: 7, specDirection: "MIN" },
  { name: "Deep focus", unit: "mins", specLimit: 90, specDirection: "MIN" },
  { name: "Leisure screen time", unit: "hrs", specLimit: 2, specDirection: "MAX" },
];
