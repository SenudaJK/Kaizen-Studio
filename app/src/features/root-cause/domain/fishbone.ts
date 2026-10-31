import type { FishboneCategory } from "../types";

export interface CategoryInfo {
  key: FishboneCategory;
  /** Plain-English name shown on the bone. */
  label: string;
  /** What kind of cause belongs here, shown as a hint. */
  hint: string;
}

/** The four fixed bones, in the order they are drawn (top row, then bottom row). */
export const FISHBONE_CATEGORIES: readonly CategoryInfo[] = [
  { key: "ENVIRONMENT", label: "Environment & space", hint: "Where you are and what's within reach" },
  { key: "ENERGY", label: "Energy & body", hint: "Sleep, food, stress, physical state" },
  { key: "ROUTINE", label: "Routine & prep", hint: "What was or wasn't set up beforehand" },
  { key: "MINDSET", label: "Mindset & cues", hint: "Thoughts, moods and digital triggers" },
];

/** Key given to the problem auto-created when diagnosing a blocker, so the UI can link to it before it exists. */
export const problemKeyForTrigger = (triggerId: string) => `blocker-${triggerId}`;

/** The one cause marked as the main root cause, if any. At most one per problem. */
export function primaryCause<T extends { isPrimary: boolean }>(causes: readonly T[]): T | null {
  return causes.find((cause) => cause.isPrimary) ?? null;
}

/** Group causes into the four bones, preserving their order. */
export function groupByCategory<T extends { category: FishboneCategory }>(
  causes: readonly T[],
): Record<FishboneCategory, T[]> {
  const grouped: Record<FishboneCategory, T[]> = { ENVIRONMENT: [], ENERGY: [], ROUTINE: [], MINDSET: [] };
  for (const cause of causes) grouped[cause.category].push(cause);
  return grouped;
}
