import { addDays, type IsoDate } from "@/lib/dates";

export interface DayScore {
  /** Habits completed that day. */
  done: number;
  /** Habits that existed (were being tracked) that day. */
  tracked: number;
}

/** A day "counts" toward the streak when at least this share of habits were done. */
export const STREAK_THRESHOLD = 0.8;

const qualifies = (score: DayScore | undefined): boolean =>
  !!score && score.tracked > 0 && score.done > 0 && score.done / score.tracked >= STREAK_THRESHOLD;

/**
 * Consecutive qualifying days ending today. If today hasn't qualified *yet*, the streak is
 * still alive and counts from yesterday, so a morning visit never shows a broken streak.
 */
export function currentStreak(scores: ReadonlyMap<IsoDate, DayScore>, today: IsoDate): number {
  let cursor = qualifies(scores.get(today)) ? today : addDays(today, -1);
  let streak = 0;
  while (qualifies(scores.get(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
