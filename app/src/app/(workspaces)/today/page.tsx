import type { Metadata } from "next";
import { hourIn, weekDays, startOfWeek } from "@/lib/dates";
import { getCurrentUser, requireUserId } from "@/lib/session";
import { getToday, getUserTimeZone } from "@/lib/timezone";
import { DailyFlow } from "@/features/check-sheet/components/daily-flow";
import { FrictionTally } from "@/features/check-sheet/components/friction-tally";
import { HabitCheckSheet } from "@/features/check-sheet/components/habit-check-sheet";
import { InsightBanner } from "@/features/check-sheet/components/insight-banner";
import { TodayHero } from "@/features/check-sheet/components/today-hero";
import { topTrigger } from "@/features/check-sheet/domain/insight";
import { describeNextUp, routineForHour } from "@/features/check-sheet/domain/next-up";
import { resolveWeekStart } from "@/features/check-sheet/domain/week";
import {
  getFrictionForWeek,
  getHabitsForWeek,
  getRoutines,
  getStreak,
  getWeekSummary,
} from "@/features/check-sheet/queries";

export const metadata: Metadata = { title: "Daily Check Sheet · Kaizen Studio" };

/**
 * Workspace 1. This file only gathers data and arranges sections; every section is its own
 * component in features/check-sheet, and all the math lives in features/check-sheet/domain.
 */
export default async function TodayPage({ searchParams }: PageProps<"/today">) {
  const [userId, timeZone, today, params, user] = await Promise.all([
    requireUserId(),
    getUserTimeZone(),
    getToday(),
    searchParams,
    getCurrentUser(),
  ]);

  const hour = hourIn(timeZone);
  const currentWeekStart = startOfWeek(today);
  const weekStart = resolveWeekStart(params.week, today);
  const isCurrentWeek = weekStart === currentWeekStart;

  const [habits, currentWeekHabits, friction, routines, summary, streak] = await Promise.all([
    getHabitsForWeek(userId, weekStart, timeZone),
    getHabitsForWeek(userId, currentWeekStart, timeZone), // same call (deduped) unless browsing a past week
    getFrictionForWeek(userId, weekStart),
    getRoutines(userId, today),
    getWeekSummary(userId, weekStart, today, timeZone),
    getStreak(userId, today, timeZone),
  ]);

  const habitsLoggedToday = currentWeekHabits.filter((h) => h.statuses[today] !== undefined).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <TodayHero
        firstName={user.name?.split(" ")[0] ?? null}
        today={today}
        hour={hour}
        weekStart={weekStart}
        isCurrentWeek={isCurrentWeek}
        summary={summary}
        streak={streak}
        habitsTotal={currentWeekHabits.length}
        habitsDoneToday={currentWeekHabits.filter((h) => h.statuses[today] === "DONE").length}
        nextUp={describeNextUp({
          hour,
          routines,
          habitsTotal: currentWeekHabits.length,
          habitsLoggedToday,
        })}
      />

      <InsightBanner top={topTrigger(friction)} summary={summary} />

      <DailyFlow routines={routines} initialRoutine={routineForHour(hour)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <HabitCheckSheet
          className="lg:col-span-7"
          habits={habits}
          triggers={friction.map(({ id, name }) => ({ id, name }))}
          days={weekDays(weekStart)}
          today={today}
          weekStart={weekStart}
          isCurrentWeek={isCurrentWeek}
        />
        <FrictionTally className="lg:col-span-5" triggers={friction} canEdit={isCurrentWeek} />
      </div>
    </div>
  );
}
