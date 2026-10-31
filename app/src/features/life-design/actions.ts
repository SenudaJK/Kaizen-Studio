"use server";

import { prisma } from "@/lib/prisma";
import { ActionError, runAction } from "@/lib/run-action";
import type { ActionResult } from "@/lib/action-result";
import { nextNodeCode } from "./domain/arrow";
import {
  addNodeSchema,
  addPillarSchema,
  addScenarioSchema,
  deletePillarSchema,
  nodeIdSchema,
  scenarioIdSchema,
  setArrowGoalSchema,
  setNodePathSchema,
  setObjectiveSchema,
} from "./schemas";

/**
 * Write side of Life Design. Same shape as the other workspaces: `runAction` authenticates,
 * validates and refreshes; every `where` carries `userId` (directly or through the parent pillar).
 */

export async function setObjective(input: unknown): Promise<ActionResult> {
  return runAction(setObjectiveSchema, input, async ({ data, userId }) => {
    const pdpcObjective = data.objective || null;
    await prisma.lifeGoal.upsert({ where: { userId }, create: { userId, pdpcObjective }, update: { pdpcObjective } });
  });
}

export async function setArrowGoal(input: unknown): Promise<ActionResult> {
  return runAction(setArrowGoalSchema, input, async ({ data, userId }) => {
    const arrowGoal = data.goal || null;
    await prisma.lifeGoal.upsert({ where: { userId }, create: { userId, arrowGoal }, update: { arrowGoal } });
  });
}

export async function addPillar(input: unknown): Promise<ActionResult> {
  return runAction(addPillarSchema, input, async ({ data, userId }) => {
    const last = await prisma.pdpcPillar.aggregate({ where: { userId }, _max: { order: true } });
    await prisma.pdpcPillar.create({ data: { userId, title: data.title, subtitle: data.subtitle, order: (last._max.order ?? 0) + 1 } });
  });
}

export async function deletePillar(input: unknown): Promise<ActionResult> {
  return runAction(deletePillarSchema, input, async ({ data, userId }) => {
    await prisma.pdpcPillar.deleteMany({ where: { id: data.pillarId, userId } }); // scenarios cascade
  });
}

export async function addScenario(input: unknown): Promise<ActionResult> {
  return runAction(addScenarioSchema, input, async ({ data, userId }) => {
    const pillar = await prisma.pdpcPillar.findFirst({ where: { id: data.pillarId, userId }, select: { id: true } });
    if (!pillar) throw new ActionError("That pillar no longer exists.");
    await prisma.pdpcScenario.create({ data: { pdpcPillarId: pillar.id, risk: data.risk, counter: data.counter } });
  });
}

export async function deleteScenario(input: unknown): Promise<ActionResult> {
  return runAction(scenarioIdSchema, input, async ({ data, userId }) => {
    await prisma.pdpcScenario.deleteMany({ where: { id: data.scenarioId, pdpcPillar: { userId } } });
  });
}

/** Switch a countermeasure on or off as a standing plan. */
export async function toggleScenario(input: unknown): Promise<ActionResult> {
  return runAction(scenarioIdSchema, input, async ({ data, userId }) => {
    const scenario = await prisma.pdpcScenario.findFirst({
      where: { id: data.scenarioId, pdpcPillar: { userId } },
      select: { id: true, active: true },
    });
    if (!scenario) throw new ActionError("That risk no longer exists.");
    await prisma.pdpcScenario.update({ where: { id: scenario.id }, data: { active: !scenario.active } });
  });
}

export async function addNode(input: unknown): Promise<ActionResult> {
  return runAction(addNodeSchema, input, async ({ data, userId }) => {
    const last = await prisma.arrowNode.aggregate({ where: { userId }, _max: { order: true } });
    const { order, code } = nextNodeCode(last._max.order ?? 0);
    await prisma.arrowNode.create({
      data: { userId, order, code, title: data.title, durationDays: data.durationDays, path: data.path },
    });
  });
}

export async function deleteNode(input: unknown): Promise<ActionResult> {
  return runAction(nodeIdSchema, input, async ({ data, userId }) => {
    await prisma.arrowNode.deleteMany({ where: { id: data.nodeId, userId } });
  });
}

export async function toggleNode(input: unknown): Promise<ActionResult> {
  return runAction(nodeIdSchema, input, async ({ data, userId }) => {
    const node = await prisma.arrowNode.findFirst({ where: { id: data.nodeId, userId }, select: { id: true, done: true } });
    if (!node) throw new ActionError("That milestone no longer exists.");
    await prisma.arrowNode.update({ where: { id: node.id }, data: { done: !node.done } });
  });
}

export async function setNodePath(input: unknown): Promise<ActionResult> {
  return runAction(setNodePathSchema, input, async ({ data, userId }) => {
    await prisma.arrowNode.updateMany({ where: { id: data.nodeId, userId }, data: { path: data.path } });
  });
}
