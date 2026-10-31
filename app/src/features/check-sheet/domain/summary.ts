import type { IsoDate } from "@/lib/dates";
import type { FrictionTriggerDto, HabitDto } from "../types";
import { MIN_OPPORTUNITIES_FOR_SIGMA, sigmaFromYield } from "./sigma";
import { combineYields, habitYield, yieldRatio, type Yield } from "./yield";

export interface WeekSummary {
  yield: Yield;
  /** 0–1 share of habit-days done, or null before there is anything to measure. */
  ratio: number | null;
  /** Reliability score, or null until there are enough chances to be meaningful. */
  sigma: number | null;
  /** Blockers tallied this week. */
  blockerCount: number;
}

export function summarizeWeek(
  habits: readonly HabitDto[],
  days: IsoDate[],
  today: IsoDate,
  triggers: readonly FrictionTriggerDto[],
): WeekSummary {
  const total = combineYields(habits.map((h) => habitYield(h, days, today)));
  const ratio = yieldRatio(total);
  return {
    yield: total,
    ratio,
    sigma: ratio !== null && total.opportunities >= MIN_OPPORTUNITIES_FOR_SIGMA ? sigmaFromYield(ratio) : null,
    blockerCount: triggers.reduce((sum, t) => sum + t.weekCount, 0),
  };
}
