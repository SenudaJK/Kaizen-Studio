import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { addDays, fromDbDate, todayIn, toDbDate, weekDays, type IsoDate } from "@/lib/dates";
import { buildDayScores } from "./domain/day-scores";
import { currentStreak } from "./domain/streak";
import { summarizeWeek, type WeekSummary } from "./domain/summary";
import type { FlowRoutineDto, FlowRoutineType, FrictionTriggerDto, HabitDto, LoggedStatus } from "./types";

/**
 * Read side of the Daily Check Sheet workspace.
 *
 * Every function takes `userId` explicitly and puts it in the query's `where`, so tenant
 * isolation is visible in each query rather than implied. Functions are wrapped in React's
 * `cache` so the layout and the page can ask for the same data without a second round trip.
 */

/** Habits with their logged days for the week starting `weekStart`. */
export const getHabitsForWeek = cache(
  async (userId: string, weekStart: IsoDate, timeZone: string): Promise<HabitDto[]> => {
    const days = weekDays(weekStart);
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      orderBy: { createdAt: "asc" },
      include: {
        logs: {
          where: { date: { gte: toDbDate(days[0]), lte: toDbDate(days[6]) }, status: { in: ["DONE", "SLIP"] } },
        },
      },
    });

    return habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      target: habit.target,
      startsOn: todayIn(timeZone, habit.createdAt),
      statuses: Object.fromEntries(
        habit.logs.map((log) => [fromDbDate(log.date), log.status as LoggedStatus]),
      ),
    }));
  },
);

/** Every blocker the user tracks, with how many times it was tallied in the given week. */
export const getFrictionForWeek = cache(async (userId: string, weekStart: IsoDate): Promise<FrictionTriggerDto[]> => {
  const weekEnd = addDays(weekStart, 6);
  const [triggers, counts] = await Promise.all([
    prisma.frictionTrigger.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.frictionTally.groupBy({
      by: ["frictionTriggerId"],
      where: { frictionTrigger: { userId }, loggedOn: { gte: toDbDate(weekStart), lte: toDbDate(weekEnd) } },
      _count: { _all: true },
    }),
  ]);

  const countById = new Map(counts.map((row) => [row.frictionTriggerId, row._count._all]));
  return triggers
    .map((t) => ({ id: t.id, name: t.name, weekCount: countById.get(t.id) ?? 0 }))
    .sort((a, b) => b.weekCount - a.weekCount || a.name.localeCompare(b.name));
});

/** Both daily routines, with today's completion state. Always returns both, possibly empty. */
export const getRoutines = cache(
  async (userId: string, today: IsoDate): Promise<Record<FlowRoutineType, FlowRoutineDto>> => {
    const routines = await prisma.flowRoutine.findMany({
      where: { userId },
      include: {
        steps: { orderBy: { order: "asc" }, include: { logs: { where: { date: toDbDate(today) }, select: { id: true } } } },
      },
    });

    const toDto = (type: FlowRoutineType): FlowRoutineDto => ({
      type,
      steps: (routines.find((r) => r.type === type)?.steps ?? []).map((step) => ({
        id: step.id,
        name: step.name,
        durationMin: step.durationMin,
        kind: step.kind,
        doneToday: step.logs.length > 0,
      })),
    });
    return { MORNING: toDto("MORNING"), EVENING: toDto("EVENING") };
  },
);

/** Weekly yield / sigma / blocker count, shared by the page header and the sidebar card. */
export const getWeekSummary = cache(
  async (userId: string, weekStart: IsoDate, today: IsoDate, timeZone: string): Promise<WeekSummary> => {
    const [habits, triggers] = await Promise.all([
      getHabitsForWeek(userId, weekStart, timeZone),
      getFrictionForWeek(userId, weekStart),
    ]);
    return summarizeWeek(habits, weekDays(weekStart), today, triggers);
  },
);

const STREAK_LOOKBACK_DAYS = 90;

export const getStreak = cache(async (userId: string, today: IsoDate, timeZone: string): Promise<number> => {
  const from = addDays(today, -(STREAK_LOOKBACK_DAYS - 1));
  const [habits, doneLogs] = await Promise.all([
    prisma.habit.findMany({ where: { userId, archived: false }, select: { createdAt: true } }),
    prisma.habitLog.findMany({
      where: { habit: { userId, archived: false }, status: "DONE", date: { gte: toDbDate(from), lte: toDbDate(today) } },
      select: { date: true },
    }),
  ]);

  const scores = buildDayScores(
    habits.map((h) => todayIn(timeZone, h.createdAt)),
    doneLogs.map((l) => fromDbDate(l.date)),
    from,
    today,
  );
  return currentStreak(scores, today);
});

/** Lifetime completed habit check-ins: the number belt rank is earned from. */
export const getLifetimeCheckIns = cache(async (userId: string): Promise<number> =>
  prisma.habitLog.count({ where: { habit: { userId }, status: "DONE" } }),
);

/** Just the blockers, for the global quick-log button (counts not needed). */
export const getTriggerOptions = cache(async (userId: string): Promise<Array<{ id: string; name: string }>> =>
  prisma.frictionTrigger.findMany({ where: { userId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
);
