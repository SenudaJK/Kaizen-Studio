import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ArrowNodeDto, LifeGoalDto, PdpcPillarDto } from "./types";

/** Read side of Life Design. Every function takes `userId` and puts it in the query's `where`. */

export const getPdpcPillars = cache(async (userId: string): Promise<PdpcPillarDto[]> => {
  const pillars = await prisma.pdpcPillar.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: { scenarios: { orderBy: { id: "asc" } } },
  });
  return pillars.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    scenarios: p.scenarios.map((s) => ({ id: s.id, risk: s.risk, counter: s.counter, active: s.active })),
  }));
});

export const getArrowNodes = cache(async (userId: string): Promise<ArrowNodeDto[]> => {
  const nodes = await prisma.arrowNode.findMany({ where: { userId }, orderBy: { order: "asc" } });
  return nodes.map((n) => ({ id: n.id, code: n.code, title: n.title, durationDays: n.durationDays, path: n.path, done: n.done }));
});

export const getLifeGoal = cache(async (userId: string): Promise<LifeGoalDto> => {
  const row = await prisma.lifeGoal.findUnique({ where: { userId } });
  return { pdpcObjective: row?.pdpcObjective ?? null, arrowGoal: row?.arrowGoal ?? null };
});
