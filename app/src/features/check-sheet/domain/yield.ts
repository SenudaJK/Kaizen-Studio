import type { IsoDate } from "@/lib/dates";
import type { HabitDto } from "../types";

export interface Yield {
  /** Days the habit was done. */
  done: number;
  /** Habit-days that have happened so far (the chances you had to get it right). */
  opportunities: number;
}

/**
 * Yield = successes ÷ opportunities.
 *
 * An opportunity is any day that is over (and after the habit was created), plus today once
 * you've logged it. Past days you never logged count as misses; today stays neutral until you
 * check in, so opening the app in the morning never lowers your score.
 */
export function habitYield(habit: HabitDto, days: IsoDate[], today: IsoDate): Yield {
  let done = 0;
  let opportunities = 0;
  for (const day of days) {
    if (day < habit.startsOn) continue;
    const status = habit.statuses[day];
    const dayIsOver = day < today;
    const todayIsLogged = day === today && status !== undefined;
    if (dayIsOver || todayIsLogged) opportunities += 1;
    if (status === "DONE") done += 1;
  }
  return { done, opportunities };
}

export function combineYields(yields: Yield[]): Yield {
  return yields.reduce(
    (total, y) => ({ done: total.done + y.done, opportunities: total.opportunities + y.opportunities }),
    { done: 0, opportunities: 0 },
  );
}

/** 0–1, or null when there is nothing to measure yet. */
export function yieldRatio({ done, opportunities }: Yield): number | null {
  return opportunities === 0 ? null : done / opportunities;
}
