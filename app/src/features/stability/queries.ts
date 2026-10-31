import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { fromDbDate } from "@/lib/dates";
import type { SpcMetricDto } from "./types";

/** More than the chart shows (30): the scatter pairs older days too. */
const READINGS_PER_METRIC = 90;

/**
 * Read side of Stability & Correlations. Takes `userId` and puts it in the `where`;
 * control limits and correlations are derived in `domain/`, never stored.
 */
export const getSpcMetrics = cache(async (userId: string): Promise<SpcMetricDto[]> => {
  const metrics = await prisma.spcMetric.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { dataPoints: { orderBy: { date: "desc" }, take: READINGS_PER_METRIC } },
  });

  return metrics.map((metric) => ({
    id: metric.id,
    key: metric.key,
    name: metric.name,
    unit: metric.unit,
    specLimit: metric.specLimit,
    specDirection: metric.specDirection,
    readings: metric.dataPoints
      .toReversed()
      .map((p) => ({ id: p.id, date: fromDbDate(p.date), value: p.value, note: p.note })),
  }));
});
