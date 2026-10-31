"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ActionError, runAction } from "@/lib/run-action";
import type { ActionResult } from "@/lib/action-result";
import { problemKeyForTrigger } from "./domain/fishbone";
import {
  addCauseSchema,
  createProblemSchema,
  deleteProblemSchema,
  diagnoseBlockerSchema,
  removeCauseSchema,
  setPrimaryCauseSchema,
} from "./schemas";

/**
 * Write side of the Root-Cause Studio. Same shape as the check-sheet actions: `runAction`
 * authenticates, validates and refreshes; every `where` carries `userId` (directly or through
 * the parent problem), so one user can never touch another's rows.
 */

/** Start a fishbone for a slip the user describes themselves. */
export async function createProblem(input: unknown): Promise<ActionResult> {
  return runAction(createProblemSchema, input, async ({ data, userId }) => {
    await prisma.fishboneProblem.create({ data: { userId, key: `p-${randomUUID().slice(0, 8)}`, title: data.title } });
  });
}

/**
 * Start (or reopen) the fishbone for a tallied blocker. The key is derived from the blocker id,
 * so the UI can link to it straight away and repeat clicks never create a duplicate.
 */
export async function diagnoseBlocker(input: unknown): Promise<ActionResult> {
  return runAction(diagnoseBlockerSchema, input, async ({ data, userId }) => {
    const trigger = await prisma.frictionTrigger.findFirst({ where: { id: data.triggerId, userId }, select: { id: true, name: true } });
    if (!trigger) throw new ActionError("That blocker no longer exists.");

    const key = problemKeyForTrigger(trigger.id);
    await prisma.$transaction([
      prisma.fishboneProblem.upsert({
        where: { userId_key: { userId, key } },
        create: { userId, key, title: trigger.name },
        update: {},
      }),
      prisma.frictionTrigger.update({ where: { id: trigger.id }, data: { linkedBone: key } }),
    ]);
  });
}

export async function deleteProblem(input: unknown): Promise<ActionResult> {
  return runAction(deleteProblemSchema, input, async ({ data, userId }) => {
    const problem = await prisma.fishboneProblem.findFirst({ where: { id: data.problemId, userId }, select: { id: true, key: true } });
    if (!problem) return; // already gone: deleting twice is fine

    await prisma.$transaction([
      // Don't leave blockers pointing at a fishbone that no longer exists.
      prisma.frictionTrigger.updateMany({ where: { userId, linkedBone: problem.key }, data: { linkedBone: null } }),
      prisma.fishboneProblem.delete({ where: { id: problem.id } }),
    ]);
  });
}

/** The first cause added to a problem becomes its primary root cause; later ones don't steal the spot. */
export async function addCause(input: unknown): Promise<ActionResult> {
  return runAction(addCauseSchema, input, async ({ data, userId }) => {
    const problem = await prisma.fishboneProblem.findFirst({ where: { id: data.problemId, userId }, select: { id: true } });
    if (!problem) throw new ActionError("That diagnosis no longer exists.");

    const hasPrimary = (await prisma.fishboneCause.count({ where: { fishboneProblemId: problem.id, isPrimary: true } })) > 0;
    await prisma.fishboneCause.create({
      data: {
        fishboneProblemId: problem.id,
        category: data.category,
        text: data.text,
        fix: data.fix,
        isPrimary: !hasPrimary,
      },
    });
  });
}

export async function removeCause(input: unknown): Promise<ActionResult> {
  return runAction(removeCauseSchema, input, async ({ data, userId }) => {
    await prisma.fishboneCause.deleteMany({ where: { id: data.causeId, fishboneProblem: { userId } } });
  });
}

/** Exactly one primary cause per problem: clear the others and set this one atomically. */
export async function setPrimaryCause(input: unknown): Promise<ActionResult> {
  return runAction(setPrimaryCauseSchema, input, async ({ data, userId }) => {
    const cause = await prisma.fishboneCause.findFirst({
      where: { id: data.causeId, fishboneProblem: { userId } },
      select: { id: true, fishboneProblemId: true },
    });
    if (!cause) throw new ActionError("That cause no longer exists.");

    await prisma.$transaction([
      prisma.fishboneCause.updateMany({ where: { fishboneProblemId: cause.fishboneProblemId }, data: { isPrimary: false } }),
      prisma.fishboneCause.update({ where: { id: cause.id }, data: { isPrimary: true } }),
    ]);
  });
}
