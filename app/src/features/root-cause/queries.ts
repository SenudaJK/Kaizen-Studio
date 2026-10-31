import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toDbDate, type IsoDate } from "@/lib/dates";
import type { FishboneProblemDto, ParetoTriggerDto } from "./types";

/**
 * Read side of the Root-Cause Studio. Every function takes `userId` and puts it in the
 * query's `where`; cumulative percentages and the Vital Few are derived in `domain/`, never stored.
 */

/** Every blocker the user tracks with its tally count between `from` and `to` (inclusive). */
export const getParetoTriggers = cache(
  async (userId: string, from: IsoDate, to: IsoDate): Promise<ParetoTriggerDto[]> => {
    const [triggers, counts, problems] = await Promise.all([
      prisma.frictionTrigger.findMany({ where: { userId }, select: { id: true, name: true, linkedBone: true } }),
      prisma.frictionTally.groupBy({
        by: ["frictionTriggerId"],
        where: { frictionTrigger: { userId }, loggedOn: { gte: toDbDate(from), lte: toDbDate(to) } },
        _count: { _all: true },
      }),
      prisma.fishboneProblem.findMany({ where: { userId }, select: { key: true } }),
    ]);

    const countById = new Map(counts.map((row) => [row.frictionTriggerId, row._count._all]));
    const existingKeys = new Set(problems.map((p) => p.key));
    return triggers.map((t) => ({
      id: t.id,
      name: t.name,
      count: countById.get(t.id) ?? 0,
      // Ignore a stale link whose problem was deleted.
      problemKey: t.linkedBone && existingKeys.has(t.linkedBone) ? t.linkedBone : null,
    }));
  },
);

/** All of the user's fishbone problems with their causes, ordered for stable display. */
export const getFishboneProblems = cache(async (userId: string): Promise<FishboneProblemDto[]> => {
  const problems = await prisma.fishboneProblem.findMany({
    where: { userId },
    orderBy: { title: "asc" },
    include: { causes: { orderBy: { id: "asc" } } },
  });

  return problems.map((problem) => ({
    id: problem.id,
    key: problem.key,
    title: problem.title,
    causes: problem.causes.map((cause) => ({
      id: cause.id,
      category: cause.category,
      text: cause.text,
      fix: cause.fix,
      isPrimary: cause.isPrimary,
    })),
  }));
});
