"use server";

import { prisma } from "@/lib/prisma";
import { toDbDate } from "@/lib/dates";
import { ActionError, runAction } from "@/lib/run-action";
import type { ActionResult } from "@/lib/action-result";
import {
  addFlowStepSchema,
  addFrictionTriggerSchema,
  addHabitSchema,
  applyStarterRoutineSchema,
  archiveHabitSchema,
  logFrictionSchema,
  removeFlowStepSchema,
  setHabitStatusSchema,
  toggleFlowStepSchema,
  undoFrictionSchema,
} from "./schemas";
import { STARTER_ROUTINES } from "./starter-templates";

/**
 * Write side of the Daily Check Sheet workspace. Each action is thin: `runAction` handles
 * auth + validation + refresh, and the body only expresses what changes. Every `where` clause
 * includes `userId` (directly or through the parent), so one user can never touch another's rows.
 */

// ─── Habits ─────────────────────────────────────────────────────────────────

export async function setHabitStatus(input: unknown): Promise<ActionResult> {
  return runAction(setHabitStatusSchema, input, async ({ data, userId, today }) => {
    if (data.date > today) throw new ActionError("You can't check in on a day that hasn't happened yet.");

    const habit = await prisma.habit.findFirst({ where: { id: data.habitId, userId, archived: false }, select: { id: true } });
    if (!habit) throw new ActionError("That habit no longer exists.");

    const date = toDbDate(data.date);
    if (data.status === "PENDING") {
      await prisma.habitLog.deleteMany({ where: { habitId: habit.id, date } });
      return;
    }
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: habit.id, date } },
      create: { habitId: habit.id, date, status: data.status },
      update: { status: data.status },
    });
  });
}

export async function addHabit(input: unknown): Promise<ActionResult> {
  return runAction(addHabitSchema, input, async ({ data, userId }) => {
    await prisma.habit.create({ data: { userId, name: data.name, target: data.target } });
  });
}

export async function archiveHabit(input: unknown): Promise<ActionResult> {
  return runAction(archiveHabitSchema, input, async ({ data, userId }) => {
    // Archive rather than delete so past weeks keep their history.
    await prisma.habit.updateMany({ where: { id: data.habitId, userId }, data: { archived: true } });
  });
}

// ─── Daily flow (morning / evening routines) ────────────────────────────────

export async function toggleFlowStep(input: unknown): Promise<ActionResult> {
  return runAction(toggleFlowStepSchema, input, async ({ data, userId, today }) => {
    const step = await prisma.flowStep.findFirst({ where: { id: data.stepId, flowRoutine: { userId } }, select: { id: true } });
    if (!step) throw new ActionError("That step no longer exists.");

    const date = toDbDate(today);
    if (data.done) {
      await prisma.flowStepLog.upsert({
        where: { flowStepId_date: { flowStepId: step.id, date } },
        create: { flowStepId: step.id, date },
        update: {},
      });
    } else {
      await prisma.flowStepLog.deleteMany({ where: { flowStepId: step.id, date } });
    }
  });
}

export async function addFlowStep(input: unknown): Promise<ActionResult> {
  return runAction(addFlowStepSchema, input, async ({ data, userId }) => {
    const routine = await prisma.flowRoutine.upsert({
      where: { userId_type: { userId, type: data.routine } },
      create: { userId, type: data.routine },
      update: {},
    });
    const last = await prisma.flowStep.aggregate({ where: { flowRoutineId: routine.id }, _max: { order: true } });
    await prisma.flowStep.create({
      data: {
        flowRoutineId: routine.id,
        order: (last._max.order ?? 0) + 1,
        name: data.name,
        durationMin: data.durationMin,
        kind: data.kind,
      },
    });
  });
}

export async function removeFlowStep(input: unknown): Promise<ActionResult> {
  return runAction(removeFlowStepSchema, input, async ({ data, userId }) => {
    await prisma.flowStep.deleteMany({ where: { id: data.stepId, flowRoutine: { userId } } });
  });
}

/** Opt-in: fills an *empty* routine with a suggested set of steps. */
export async function applyStarterRoutine(input: unknown): Promise<ActionResult> {
  return runAction(applyStarterRoutineSchema, input, async ({ data, userId }) => {
    const routine = await prisma.flowRoutine.upsert({
      where: { userId_type: { userId, type: data.routine } },
      create: { userId, type: data.routine },
      update: {},
    });
    if ((await prisma.flowStep.count({ where: { flowRoutineId: routine.id } })) > 0) {
      throw new ActionError("This routine already has steps.");
    }
    await prisma.flowStep.createMany({
      data: STARTER_ROUTINES[data.routine].map((step, index) => ({ ...step, flowRoutineId: routine.id, order: index + 1 })),
    });
  });
}

// ─── Blockers (friction tallies) ────────────────────────────────────────────

export async function logFriction(input: unknown): Promise<ActionResult> {
  return runAction(logFrictionSchema, input, async ({ data, userId, today }) => {
    const trigger = await prisma.frictionTrigger.findFirst({ where: { id: data.triggerId, userId }, select: { id: true } });
    if (!trigger) throw new ActionError("That blocker no longer exists.");
    await prisma.frictionTally.create({ data: { frictionTriggerId: trigger.id, loggedOn: toDbDate(today) } });
  });
}

export async function undoFriction(input: unknown): Promise<ActionResult> {
  return runAction(undoFrictionSchema, input, async ({ data, userId }) => {
    const latest = await prisma.frictionTally.findFirst({
      where: { frictionTriggerId: data.triggerId, frictionTrigger: { userId } },
      orderBy: { loggedAt: "desc" },
      select: { id: true },
    });
    if (latest) await prisma.frictionTally.delete({ where: { id: latest.id } });
  });
}

export async function addFrictionTrigger(input: unknown): Promise<ActionResult> {
  return runAction(addFrictionTriggerSchema, input, async ({ data, userId, today }) => {
    const existing = await prisma.frictionTrigger.findFirst({
      where: { userId, name: { equals: data.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) throw new ActionError("You're already tracking that blocker.");

    await prisma.frictionTrigger.create({
      data: {
        userId,
        name: data.name,
        ...(data.logNow && { tallies: { create: { loggedOn: toDbDate(today) } } }),
      },
    });
  });
}
