"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { toDbDate, type IsoDate } from "@/lib/dates";
import { ActionError, runAction } from "@/lib/run-action";
import type { ActionResult } from "@/lib/action-result";
import {
  createMetricSchema,
  createMetricsSchema,
  deleteMetricSchema,
  deleteReadingSchema,
  logReadingSchema,
  setSpecLimitSchema,
} from "./schemas";

/**
 * Write side of Stability & Correlations. Same shape as the other workspaces: `runAction`
 * authenticates, validates and refreshes; every `where` carries `userId` (directly or through
 * the parent metric), so one user can never touch another's rows.
 */

const newKey = () => `m-${randomUUID().slice(0, 8)}`;

export async function createMetric(input: unknown): Promise<ActionResult> {
  return runAction(createMetricSchema, input, async ({ data, userId }) => {
    await prisma.spcMetric.create({ data: { userId, key: newKey(), ...data } });
  });
}

/** Adds several metrics at once (the starter set). */
export async function createMetrics(input: unknown): Promise<ActionResult> {
  return runAction(createMetricsSchema, input, async ({ data, userId }) => {
    await prisma.spcMetric.createMany({ data: data.metrics.map((metric) => ({ userId, key: newKey(), ...metric })) });
  });
}

export async function deleteMetric(input: unknown): Promise<ActionResult> {
  return runAction(deleteMetricSchema, input, async ({ data, userId }) => {
    // Readings cascade with the metric. deleteMany keeps the userId filter and makes a repeat a no-op.
    await prisma.spcMetric.deleteMany({ where: { id: data.metricId, userId } });
  });
}

export async function setSpecLimit(input: unknown): Promise<ActionResult> {
  return runAction(setSpecLimitSchema, input, async ({ data, userId }) => {
    const { count } = await prisma.spcMetric.updateMany({
      where: { id: data.metricId, userId },
      data: { specLimit: data.specLimit },
    });
    if (count === 0) throw new ActionError("That metric no longer exists.");
  });
}

/** One reading per metric per day: logging the same day again replaces the earlier value. */
export async function logReading(input: unknown): Promise<ActionResult> {
  return runAction(logReadingSchema, input, async ({ data, userId, today }) => {
    const date: IsoDate = (data.date as IsoDate | undefined) ?? today;
    if (date > today) throw new ActionError("You can't log a reading for a future day.");

    const metric = await prisma.spcMetric.findFirst({ where: { id: data.metricId, userId }, select: { id: true } });
    if (!metric) throw new ActionError("That metric no longer exists.");

    const note = data.note ?? null;
    await prisma.spcDataPoint.upsert({
      where: { spcMetricId_date: { spcMetricId: metric.id, date: toDbDate(date) } },
      create: { spcMetricId: metric.id, date: toDbDate(date), value: data.value, note },
      update: { value: data.value, note },
    });
  });
}

export async function deleteReading(input: unknown): Promise<ActionResult> {
  return runAction(deleteReadingSchema, input, async ({ data, userId }) => {
    await prisma.spcDataPoint.deleteMany({ where: { id: data.readingId, spcMetric: { userId } } });
  });
}
