import { describe, expect, it } from "vitest";
import type { IsoDate } from "@/lib/dates";
import { buildControlChart, controlLimits, meetsSpec, specSliderRange, summarizeSpec, type SpcReading } from "./control-limits";

const reading = (day: number, value: number): SpcReading => ({
  id: `r${day}`,
  date: `2026-10-${String(day).padStart(2, "0")}` as IsoDate,
  value,
  note: null,
});

describe("controlLimits", () => {
  it("needs five readings before it will draw limits", () => {
    expect(controlLimits([7, 7.5, 6.8, 7.2])).toBeNull();
    expect(controlLimits([7, 7.5, 6.8, 7.2, 7.1])).not.toBeNull();
  });

  it("centres on the mean and spreads by 2.66 × average moving range", () => {
    // Moving ranges: 1, 1, 1, 0 → average 0.75; mean 7.
    const limits = controlLimits([6, 7, 8, 7, 7]);
    expect(limits?.mean).toBeCloseTo(7.0);
    expect(limits?.ucl).toBeCloseTo(7 + 2.66 * 0.75, 5);
  });

  it("never lets the lower limit go below zero", () => {
    const limits = controlLimits([1, 5, 1, 5, 1, 5]);
    expect(limits?.lcl).toBe(0);
  });

  it("collapses to the mean when every reading is identical", () => {
    expect(controlLimits([7, 7, 7, 7, 7])).toEqual({ mean: 7, ucl: 7, lcl: 7 });
  });
});

describe("buildControlChart", () => {
  it("sorts by date and flags points outside the limits as Special Causes", () => {
    const readings = [reading(5, 7.1), reading(1, 7), reading(3, 7.2), reading(2, 6.9), reading(4, 7), reading(6, 7.1), reading(7, 7), reading(8, 3)];
    const { points, limits } = buildControlChart(readings);
    expect(points.map((p) => p.date)).toEqual(readings.toSorted((a, b) => a.date.localeCompare(b.date)).map((r) => r.date));
    expect(limits).not.toBeNull();
    expect(points.filter((p) => p.isSpecialCause).map((p) => p.value)).toEqual([3]);
  });

  it("flags nothing while there are too few readings", () => {
    const { points, limits } = buildControlChart([reading(1, 7), reading(2, 99)]);
    expect(limits).toBeNull();
    expect(points.every((p) => !p.isSpecialCause)).toBe(true);
  });

  it("keeps only the most recent 30 readings", () => {
    const dated = Array.from({ length: 40 }, (_, i) => ({
      id: `r${i}`,
      date: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10) as IsoDate,
      value: 7,
      note: null,
    }));
    expect(buildControlChart(dated).points).toHaveLength(30);
  });
});

describe("spec limits", () => {
  it("treats MIN as at-or-above and MAX as at-or-below", () => {
    expect(meetsSpec(7, 7, "MIN")).toBe(true);
    expect(meetsSpec(6.9, 7, "MIN")).toBe(false);
    expect(meetsSpec(2, 2, "MAX")).toBe(true);
    expect(meetsSpec(2.1, 2, "MAX")).toBe(false);
  });

  it("summarizes the share of days on target", () => {
    expect(summarizeSpec([6, 7, 8, 9], 7, "MIN")).toEqual({ met: 3, total: 4, ratio: 0.75 });
    expect(summarizeSpec([], 7, "MIN").ratio).toBeNull();
  });
});

describe("specSliderRange", () => {
  it("covers every reading and the current target", () => {
    const range = specSliderRange([6.2, 7.4, 8.1], 7);
    expect(range.min).toBeLessThanOrEqual(6.2);
    expect(range.max).toBeGreaterThanOrEqual(8.1);
    expect(range.step).toBe(0.1);
  });

  it("uses coarser steps for big numbers and never goes below zero", () => {
    const range = specSliderRange([60, 90, 120], 90);
    expect(range.step).toBe(5);
    expect(range.min).toBeGreaterThanOrEqual(0);
  });

  it("still gives a usable range with no readings", () => {
    const range = specSliderRange([], 7);
    expect(range.max).toBeGreaterThan(range.min);
  });
});
