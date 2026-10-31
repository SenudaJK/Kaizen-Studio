import { addDays, daysBetween, type IsoDate } from "@/lib/dates";
import type { DayScore } from "./streak";

/**
 * Builds the per-day "habits done vs habits tracked" scores that the streak is computed from.
 * A habit counts as tracked from the day it started.
 */
export function buildDayScores(
  habitStarts: readonly IsoDate[],
  doneDates: readonly IsoDate[],
  from: IsoDate,
  to: IsoDate,
): Map<IsoDate, DayScore> {
  const doneByDay = new Map<IsoDate, number>();
  for (const date of doneDates) doneByDay.set(date, (doneByDay.get(date) ?? 0) + 1);

  const scores = new Map<IsoDate, DayScore>();
  for (let i = 0; i <= daysBetween(from, to); i += 1) {
    const day = addDays(from, i);
    scores.set(day, {
      done: doneByDay.get(day) ?? 0,
      tracked: habitStarts.filter((start) => start <= day).length,
    });
  }
  return scores;
}
